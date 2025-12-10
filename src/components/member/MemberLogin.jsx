import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAtom } from 'jotai';
import axios from 'axios';
import { loginIdState, loginRoleState, accessTokenState, refreshTokenState, loginCompleteState } from "../../utils/jotai"; 
import "./feedback.css";
import Jumbotron from "../templates/Jumbotron";

export default function MemberLogin() {
    const navigate = useNavigate();

    const [, setLoginId] = useAtom(loginIdState);
    const [, setLoginRole] = useAtom(loginRoleState);
    const [, setAccessToken] = useAtom(accessTokenState);
    const [, setRefreshToken] = useAtom(refreshTokenState);
    const [, setLoginComplete] = useAtom(loginCompleteState);

    const [member, setMember] = useState({ memberId: "", memberPw: "" });
    const [result, setResult] = useState(null);

    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setMember(prev => ({ ...prev, [name]: value }));
    }, []);

    const sendLogin = useCallback(async () => {
        try {
            const { data } = await axios.post("/member/login", member);
            setResult(true);
            console.log("Login response:", data);

            setLoginId(data.loginId);
            setLoginRole(data.loginLevel);
            console.log("저장된 loginRole:", data.loginLevel);

            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            setLoginComplete(true);

            // axios 기본 헤더도 설정
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;

            navigate("/");
        } catch (err) {
            console.error("로그인 실패:", err);
            setResult(false);
        }
    }, [member, setLoginId, setLoginRole, setAccessToken, setRefreshToken, setLoginComplete, navigate]);

    return (
        <>
            <Jumbotron subject="로그인" detail="원활한 기능 이용을 위해 로그인해주세요" />

            <div className="member-container mx-auto mt-5 p-4">
                <div className="row form-row no-border mt-4">
                    <label className="col-sm-3 col-form-label">아이디</label>
                    <div className="col-sm-9">
                        <input type="text" name="memberId" value={member.memberId} onChange={changeStrValue} className="form-control" />
                    </div>
                </div>

                <div className="row form-row mt-4">
                    <label className="col-sm-3 col-form-label">비밀번호</label>
                    <div className="col-sm-9">
                        <input type="password" name="memberPw" value={member.memberPw} onChange={changeStrValue} className="form-control" />
                    </div>
                </div>

                {result === false && (
                    <div className="row mt-4">
                        <div className="col-sm-9 offset-sm-3 text-red">
                            입력하신 정보가 올바르지 않습니다.
                        </div>
                    </div>
                )}

                <div className="row mt-5">
                    <div className="col text-center">
                        <button type="button" className="btn btn-success btn-md w-50" onClick={sendLogin}>로그인</button>
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
