import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { atom, useAtom } from 'jotai';
import axios from 'axios';
import { accessTokenState, loginIdState, loginRoleState, refreshTokenState } from "../../utils/jotai";
import "./feedback.css";
import Jumbotron from "../templates/Jumbotron";

export default function MemberJoin() {

    //이동 도구
    const navigate = useNavigate();

    //jotai state (전체 화면에 영향을 미치는 데이터)
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginRole, setLoginRole] = useAtom(loginRoleState);
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const [refreshToken, setRefreshToken] = useAtom(refreshTokenState);

    //state
    const [member, setMember] = useState({
        memberId: "",
        memberPw: ""
    });

    //callback
    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setMember(prev => ({ ...prev, [name]: value }));
    }, []);

    //로그인
    const [result, setResult] = useState(null);//null(시도한적 없음), true(성공), false(실패)
    const sendLogin = useCallback(async () => {
        try {
            const { data } = await axios.post("/member/login", member);
            setResult(true);

            setLoginId(data.loginId);
            setLoginRole(data.loginRole);

            //화면 이동
            navigate("/");
        }
        catch (err) {
            setResult(false);
        }
    }, [member]);


    return (
        <>
            <Jumbotron subject="로그인" detail="원활한 기능 이용을 위해 로그인해주세요" />

            <div className="member-container mx-auto mt-5 p-4">

               <div className="row form-row no-border mt-4">
                    <label className="col-sm-3 col-form-label">아이디</label>
                    <div className="col-sm-9">
                        <input type="text" name="memberId" value={member.memberId} onChange={changeStrValue}
                            className="form-control" />
                    </div>
                </div>

                <div className="row form-row mt-4">
                    <label className="col-sm-3 col-form-label">비밀번호 </label>
                    <div className="col-sm-9">
                        <input type="password" name="memberPw" value={member.memberPw} onChange={changeStrValue}
                            className="form-control" />
                    </div>
                </div>

                {result === false && (
                    <div className="row mt-4">
                        <div className="col-sm-9 offset-sm-3 text-danger">
                            입력하신 정보가 올바르지 않습니다.
                            다시 확인하고 입력해주세요.
                        </div>
                    </div>
                )}

                <div className="row mt-5">
                    <div className="col text-center">
                        <button type="button" className="btn btn-success btn-md w-50"
                            onClick={sendLogin}>로그인</button>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col text-center">
                        아직 계정이 없으신가요?{" "}
                        <Link to="/member/join" className="text-success" style={{ textDecoration: "underline" }}>
                            회원가입
                        </Link>
                    </div>
                </div>
            </div>

        </>
    )
}