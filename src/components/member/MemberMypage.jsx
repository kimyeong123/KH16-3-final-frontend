import { useState } from "react";
import { useAtom } from "jotai";
import { FaTrash } from "react-icons/fa";
import { FaUserLock } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import {
    loginNoState, loginIdState, loginRoleState, loginNicknameState,
    loginAddress1State, loginAddress2State, loginEmailState,
    loginPointState, loginContactState, loginCreatedTimeState,
    clearLoginState, accessTokenState, refreshTokenState
} from "../../utils/jotai";
import Jumbotron from "../templates/Jumbotron";
import axios from "axios";
import "./Member.css";

export default function MemberMypage() {
    // 로그인 관련 상태
    const [loginNo] = useAtom(loginNoState);
    const [loginId] = useAtom(loginIdState);
    const [loginRole] = useAtom(loginRoleState);
    const [nickname] = useAtom(loginNicknameState);
    const [email] = useAtom(loginEmailState);
    const [address1] = useAtom(loginAddress1State);
    const [address2] = useAtom(loginAddress2State);
    const [point] = useAtom(loginPointState);
    const [contact] = useAtom(loginContactState);
    const [createdTime] = useAtom(loginCreatedTimeState);

    // 토큰 상태
    const [accessToken] = useAtom(accessTokenState);
    const [refreshToken] = useAtom(refreshTokenState);

    // 로그인 상태 초기화 함수
    const [, clearLogin] = useAtom(clearLoginState);

    // 비밀번호 입력 상태
    const [password, setPassword] = useState("");

    // 회원 탈퇴 패널 열림/닫힘 상태
    const [showDeletePanel, setShowDeletePanel] = useState(false);

    // 탈퇴 처리 함수
    const handleDeleteAccount = async () => {
        if (!password) {
            alert("비밀번호를 입력해주세요.");
            return;
        }

        try {
            if (!loginNo) {
                alert("회원 번호가 존재하지 않습니다.");
                return;
            }

            await axios.delete(`http://localhost:8080/member/${Number(loginNo)}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                data: { memberPw: password } // 비밀번호 전달
            });

            // Jotai 상태 초기화
            clearLogin(); // 로그인 관련 모든 상태 초기화

            alert("회원 탈퇴가 완료되었습니다. 로그인 상태가 만료되었습니다.");
            setShowDeletePanel(false);
            window.location.href = "/";

        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                alert("비밀번호가 올바르지 않습니다.");
            } else if (error.response && error.response.status === 403) {
                alert("본인 계정만 탈퇴할 수 있습니다.");
            } else {
                alert("회원 탈퇴 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <>
            <Jumbotron
                subject="마이페이지"
                detail="회원 정보를 확인하고 관리할 수 있습니다."
            />

            <div className="member-container mx-auto mt-5 p-4">
                <h3 className="mb-4">
                    환영합니다, <span className="text-info">{nickname || loginId}</span>님!
                </h3>

                <div className="row g-4">
                    {/* 회원 정보 카드 */}
                    <div className="col-md-6">
                        <div className="card shadow-sm p-4 h-100">
                            <h5 className="mb-3">회원 정보</h5>
                            <p><strong>아이디 : </strong> {loginId}</p>
                            <p><strong>닉네임 : </strong> {nickname}</p>
                            <p><strong>권한 : </strong> {loginRole}</p>
                            <p><strong>이메일 : </strong> {email}</p>
                            <p><strong>기본 주소 : </strong> {address1}</p>
                            <p><strong>상세 주소 : </strong> {address2}</p>
                            <p><strong>보유 머니 : </strong> {point}p</p>
                            <p><strong>연락처 : </strong> {contact}</p>
                            <p>
                                <strong>가입일: </strong>
                                {createdTime
                                    ? (() => {
                                        const dateStr = new Date(createdTime).toLocaleDateString("ko-KR", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                        });
                                        return dateStr.replace(/\./g, ". ").replace(/\. $/, "");
                                    })()
                                    : "-"}
                            </p>
                        </div>
                    </div>

                    {/* 계정 관리 카드 */}
                    <div className="col-md-6">
                        <div className="card shadow-sm p-4 h-100 d-flex flex-column align-items-center">
                            <h5 className="mb-3">계정 관리</h5>

                            <button className="btn btn-outline-primary w-50 mb-2 d-flex align-items-center justify-content-center">
                                <FaUserPen className="me-2 fs-4" /> 회원정보 변경
                            </button>

                            <button className="btn btn-outline-primary w-50 mb-2 d-flex align-items-center justify-content-center">
                                <FaUserLock className="me-2 fs-4" /> 비밀번호 변경
                            </button>

                            {/* 회원 탈퇴 버튼 (패널 토글) */}
                            <button
                                className="btn btn-outline-danger w-50 mt-3 d-flex align-items-center justify-content-center"
                                onClick={() => setShowDeletePanel(!showDeletePanel)}
                            >
                                <FaTrash className="me-2 fs-5" /> 회원 탈퇴
                            </button>

                            {/* 회원 탈퇴 패널 (계정 관리 카드 바로 아래) */}
                            {showDeletePanel && (
                                <div className="delete-panel mt-4 w-100">
                                    <p className="mb-2 text-danger fw-semibold">
                                        탈퇴 시 계정은 복구할 수 없습니다.
                                    </p>

                                    <div className="mb-2 d-flex justify-content-center">
                                        <input
                                            type="password"
                                            className="form-control w-75"
                                            placeholder="현재 비밀번호를 입력하세요"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="d-flex justify-content-end gap-2 mt-2">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => {
                                                setPassword("");
                                                setShowDeletePanel(false);
                                            }}
                                        >
                                            취소
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={handleDeleteAccount}
                                        >
                                            탈퇴하기
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 기타 정보 카드 */}
                    <div className="col-12">
                        <div className="card shadow-sm p-4">
                            <h5 className="mb-3">기타 정보</h5>
                            <p>최근 문의내역, 상품 즐겨찾기, 충전 등 추가 기능을 여기에 표시</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
