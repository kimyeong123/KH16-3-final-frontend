import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAtom } from 'jotai';
import axios from 'axios';
import { loginIdState, loginRoleState, loginNicknameState, accessTokenState, refreshTokenState, loginCompleteState, loginEmailState, loginPostState, loginAddress1State, loginAddress2State, loginCreatedTimeState, loginPointState, loginContactState, loginNoState } from "../../utils/jotai";
import "./Member.css";
import Jumbotron from "../templates/Jumbotron";
import Swal from "sweetalert2";

export default function MemberLogin() {
    const navigate = useNavigate();

    const [, setLoginNo] = useAtom(loginNoState);
    const [, setLoginId] = useAtom(loginIdState);
    const [, setLoginRole] = useAtom(loginRoleState);
    const [, setAccessToken] = useAtom(accessTokenState);
    const [, setRefreshToken] = useAtom(refreshTokenState);
    const [, setLoginComplete] = useAtom(loginCompleteState);
    const [, setLoginNickname] = useAtom(loginNicknameState);
    const [, setLoginEmail] = useAtom(loginEmailState);
    const [, setLoginPost] = useAtom(loginPostState);
    const [, setLoginAddress1] = useAtom(loginAddress1State);
    const [, setLoginAddress2] = useAtom(loginAddress2State);
    const [, setLoginPoint] = useAtom(loginPointState);
    const [, setLoginContact] = useAtom(loginContactState);
    const [, setLoginCreatedTime] = useAtom(loginCreatedTimeState);

    const [member, setMember] = useState({ memberId: "", memberPw: "" });
    const [result, setResult] = useState(null);
    // 아이디/비번 찾기
    const [findEmail, setFindEmail] = useState("");
    const [resetId, setResetId] = useState("");
    const [resetEmail, setResetEmail] = useState("");

    // 로딩 상태
    const [finding, setFinding] = useState(false);
    const [resetting, setResetting] = useState(false);

    const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setMember(prev => ({ ...prev, [name]: value }));
    }, []);

    const closeModal = (modalId) => {
        const el = document.getElementById(modalId);
        if (!el) return;

        const Modal = window.bootstrap?.Modal;
        if (!Modal) return; 

        const instance = Modal.getInstance(el) || new Modal(el);
        instance.hide();
    };


    const sendLogin = useCallback(async () => {
        try {
            const { data } = await axios.post("/member/login", member);
            setResult(true);
            setLoginNo(data.loginNo);
            setLoginId(data.loginId);
            setLoginRole(data.loginLevel);
            setLoginNickname(data.nickname);
            setLoginEmail(data.email);
            setLoginPost(data.post);
            setLoginAddress1(data.address1);
            setLoginAddress2(data.address2);
            setLoginContact(data.contact);
            setLoginPoint(data.point);
            setLoginCreatedTime(data.createdTime);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            setLoginComplete(true);

            // axios 기본 헤더도 설정
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;

            // localStorage에 토큰 저장
            localStorage.setItem("access_token", data.accessToken);
            localStorage.setItem("refresh_token", data.refreshToken);

            console.log("로그인 응답:", data);

            navigate("/");  // 로그인 후 홈 화면으로 이동

        } catch (err) {
            console.error("로그인 실패:", err);
            setResult(false);
        }
    }, [member, navigate]);

    // 아이디 찾기 요청
    const handleFindId = useCallback(async () => {
        const email = findEmail.trim();

        if (!email) {
            return Swal.fire({ icon: "error", title: "입력 오류", text: "이메일을 입력해주세요." });
        }
        if (!emailRegex.test(email)) {
            return Swal.fire({ icon: "error", title: "형식 오류", text: "올바른 이메일 형식이 아닙니다." });
        }

        try {
            const res = await axios.post("/member/find-id", { email });

            Swal.fire({
                icon: "success",
                title: "전송 완료",
                text: res.data,
                timer: 2400,
                timerProgressBar: true,
                showConfirmButton: false,
            });

        } catch (err) {
            const msg =
                (typeof err.response?.data === "string" ? err.response.data : null) ||
                err.response?.data?.message ||
                err.message ||
                "아이디 찾기 중 오류가 발생했습니다.";

            Swal.fire({
                icon: "error",
                title: "실패",
                text: msg,
                timer: 2400,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }

    }, [findEmail]);

    // 비밀번호 재설정(임시비번 발급) 요청
    const handleResetPassword = useCallback(async () => {
        const memberId = resetId.trim();
        const email = resetEmail.trim();

        if (!memberId || !email) {
            return Swal.fire({ icon: "error", title: "입력 오류", text: "아이디와 이메일을 모두 입력해주세요." });
        }
        if (!emailRegex.test(email)) {
            return Swal.fire({ icon: "error", title: "형식 오류", text: "올바른 이메일 형식이 아닙니다." });
        }
        const ok = await Swal.fire({
            icon: "question",
            title: "임시 비밀번호 발급",
            text: "임시 비밀번호가 발급되면 기존 비밀번호로는 로그인할 수 없습니다.",
            showCancelButton: true,
            confirmButtonText: "발급",
            cancelButtonText: "취소"
        });
        if (!ok.isConfirmed) return;
        try {
            setResetting(true);

            const res = await axios.post("/member/reset-password", {
                memberId: resetId,
                email: resetEmail
            });

            await Swal.fire({
                icon: "success",
                title: "발급 완료",
                text: typeof res.data === "string" ? res.data : "임시 비밀번호를 이메일로 발송했습니다.",
                timer: 2400,
                showConfirmButton: false
            });

            try {
                closeModal("findPwModal");
            } catch (e) {
                console.error("closeModal failed:", e);
            }

            setResetId("");
            setResetEmail("");

        } catch (err) {
            const msg = err.response?.data || err.message || "비밀번호 재설정 중 오류가 발생했습니다.";
            Swal.fire({ icon: "error", title: "실패", text: msg });
        } finally {
            setResetting(false);
        }
    }, [resetId, resetEmail]);

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
                    <div className="row mt-4 justify-content-center">
                        <div className="col-auto text-red text-center">
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
                        아직 계정이 없으신가요?
                        <Link to="/member/join" className="text-success ms-2" style={{ textDecoration: "underline" }}>
                            회원가입
                        </Link>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col text-center">
                        아이디/비밀번호를 잊어버리셨나요?
                        <a
                            href="#"
                            data-bs-toggle="modal"
                            data-bs-target="#findIdModal"
                            className="text-secondary ms-2"
                            style={{ textDecoration: "underline" }}
                            onClick={(e) => e.preventDefault()}
                        >
                            아이디 찾기
                        </a>
                        <span className="mx-2 text-muted">|</span>
                        <a
                            href="#"
                            data-bs-toggle="modal"
                            data-bs-target="#findPwModal"
                            className="text-secondary"
                            style={{ textDecoration: "underline" }}
                            onClick={(e) => e.preventDefault()}
                        >
                            비밀번호 찾기
                        </a>
                    </div>
                </div>
                {/* 아이디 찾기 모달 */}
                <div className="modal fade" id="findIdModal" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">아이디 찾기</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>

                            <div className="modal-body">
                                <div className="mb-2 text-muted small">
                                    가입 시 등록한 이메일로 아이디를 보내드립니다.
                                </div>

                                <label className="form-label fw-bold">이메일</label>
                                <input
                                    type="email"
                                    className="form-control mx-auto"
                                    placeholder="example@email.com"
                                    value={findEmail}
                                    onChange={(e) => setFindEmail(e.target.value)}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                    취소
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleFindId} disabled={finding}>
                                    {finding ? "전송중..." : "아이디 전송"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 비밀번호 찾기(임시 비밀번호 발급) 모달 */}
                <div className="modal fade" id="findPwModal" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">비밀번호 찾기</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>

                            <div className="modal-body text-center">
                                <div className="mb-2 text-muted small">
                                    아이디와 가입한 이메일이 일치하면<br />
                                    임시 비밀번호를 발급해 이메일로 전송합니다.
                                </div>

                                <label className="form-label fw-bold">아이디</label>
                                <input
                                    type="text"
                                    className="form-control mb-3 mx-auto"
                                    placeholder="아이디 입력"
                                    value={resetId}
                                    onChange={(e) => setResetId(e.target.value)}

                                />

                                <label className="form-label fw-bold">이메일</label>
                                <input
                                    type="email"
                                    className="form-control mx-auto"
                                    placeholder="example@email.com"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                    취소
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleResetPassword} disabled={resetting}>
                                    {resetting ? "발급중..." : "임시 비밀번호 발급"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
