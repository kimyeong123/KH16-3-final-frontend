import { useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { FaTrash, FaUserLock, FaEnvelope, FaEraser, FaExclamationTriangle } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaUserPen } from "react-icons/fa6";
import {
    loginNoState, loginIdState, loginRoleState, loginNicknameState, loginPostState,
    loginAddress1State, loginAddress2State, loginEmailState,
    loginPointState, loginContactState, loginCreatedTimeState,
    clearLoginState, accessTokenState
} from "../../utils/jotai";
import Jumbotron from "../templates/Jumbotron";
import axios from "axios";
import "./Member.css";
import "../../styles/sweetalert2-flatly.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$])[A-Za-z0-9!@#$]{8,16}$/;
export default function MemberMypage() {
    const [loginNo] = useAtom(loginNoState);
    const [loginId] = useAtom(loginIdState);
    const [loginRole] = useAtom(loginRoleState);
    const [nickname] = useAtom(loginNicknameState);
    const [email, setLoginEmail] = useAtom(loginEmailState);
    const [post, setLoginPost] = useAtom(loginPostState);
    const [address1, setLoginAddress1] = useAtom(loginAddress1State);
    const [address2, setLoginAddress2] = useAtom(loginAddress2State);
    const [point] = useAtom(loginPointState);
    const [contact, setLoginContact] = useAtom(loginContactState);
    const [createdTime] = useAtom(loginCreatedTimeState);

    const navigete = useNavigate();

    const [accessToken] = useAtom(accessTokenState);
    const [, clearLogin] = useAtom(clearLoginState);
    // 비밀번호 변경을 위한 상태
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // 비밀번호 변경 모달
    const [currentPassword, setCurrentPassword] = useState("");       // 현재 비밀번호
    const [newPassword, setNewPassword] = useState("");               // 새 비밀번호
    const [newPasswordConfirm, setNewPasswordConfirm] = useState(""); // 새 비밀번호 확인

    const [newPasswordValid, setNewPasswordValid] = useState(null); //비밀번호 피드백
    const [isSameAsCurrent, setIsSameAsCurrent] = useState(false);//기존 비밀번호로 변경불가

    // 회원 탈퇴용
    const [showDeletePanel, setShowDeletePanel] = useState(false);
    const [password, setPassword] = useState("");

    const [isEditing, setIsEditing] = useState(false);

    const [editEmail, setEditEmail] = useState(email || "");
    const [editPost, setEditPost] = useState(post || "");
    const [editAddress1, setEditAddress1] = useState(address1 || "");
    const [editAddress2, setEditAddress2] = useState(address2 || "");
    const [editContact, setEditContact] = useState(contact || "");


    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [contactError, setContactError] = useState("");
    // 이메일 아이디/도메인 분리 상태
    const [emailId, setEmailId] = useState("");       // 이메일 아이디
    const [emailDomain, setEmailDomain] = useState(""); // 이메일 도메인
    const [isEmailCertified, setIsEmailCertified] = useState(false); // 인증 완료 여부
    const [sending, setSending] = useState(null);     // 이메일 발송 상태: null, true, false
    const [certNumber, setCertNumber] = useState(""); // 입력 인증번호
    const [certNumberClass, setCertNumberClass] = useState(""); // 인증번호 유효성 클   래스
    const [certNumberFeedback, setCertNumberFeedback] = useState(""); // 인증번호 피드백
    const [memberClass, setMemberClass] = useState({ email: "" }); // 이메일 유효성 클래스
    const [memberEmailFeedback, setMemberEmailFeedback] = useState(""); // 이메일 피드백
    useEffect(() => {
        if (email) {
            const [id, domain] = email.split("@");
            setEmailId(id);
            setEmailDomain(domain);
            setEditEmail(email);
        }
        if (post) setEditPost(post);
        if (address1) setEditAddress1(address1);
        if (address2) setEditAddress2(address2);
        if (contact) setEditContact(contact);
    }, [email, post, address1, address2, contact]); // 상태값이 변경되면 업데이트
    const openPostcode = useDaumPostcodePopup();
    


    // 주소 검색
    const searchAddress = () => {
        openPostcode({ onComplete: handleComplete });
    };

    const handleComplete = (data) => {
        setEditPost(data.zonecode);
        setEditAddress1(data.address);
    };

    const clearAddress = () => {
        setEditPost("");
        setEditAddress1("");
        setEditAddress2("");
    };

    // 이메일 인증
    const checkMemberEmail = useCallback(() => {
        const fullEmail = `${emailId.trim()}@${emailDomain.trim()}`;
        const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,6}$/;
        const valid = regex.test(fullEmail);

        setMemberClass(prev => ({
            ...prev,
            email: isEmailCertified ? "is-valid" : valid ? "is-valid" : "is-invalid"
        }));
        setMemberEmailFeedback(valid ? "" : "올바른 이메일 형식이 아닙니다");
        return valid;
    }, [emailId, emailDomain, isEmailCertified]);

    const sendCertEmail = useCallback(async () => {
        const valid = checkMemberEmail();
        if (!valid) return;

        const fullEmail = `${emailId.trim()}@${emailDomain.trim()}`;

        // 인증번호 초기화
        setCertNumber("");
        setCertNumberClass("");
        setCertNumberFeedback("");
        setIsEmailCertified(false);

        setSending(true);
        try {
            await axios.post("/cert/send", { certEmail: fullEmail });
        } catch (err) {
            console.error("이메일 발송 오류:", err);
            alert("이메일 발송 중 오류가 발생했습니다.");
        } finally {
            setSending(false);
        }
    }, [emailId, emailDomain, checkMemberEmail]);

    const sendCertCheck = useCallback(async () => {
        const fullEmail = `${emailId.trim()}@${emailDomain.trim()}`;
        try {
            const response = await axios.post("/cert/check", {
                certEmail: fullEmail,
                certNumber
            });

            if (response.data.result === true) {
                setIsEmailCertified(true);
                setMemberClass(prev => ({ ...prev, email: "is-valid" }));
                setCertNumberClass("is-valid");
                setCertNumberFeedback("인증번호 확인이 완료되었습니다.");
            } else {
                setCertNumberClass("is-invalid");
                setCertNumberFeedback(response.data.message || "인증번호가 일치하지 않습니다.");
            }
        } catch (error) {
            setCertNumberClass("is-invalid");
            setCertNumberFeedback("서버와 통신 중 오류가 발생했습니다.");
        }
    }, [emailId, emailDomain, certNumber]);


    // 연락처 형식 체크
    const handleContactChange = (value) => {
        setEditContact(value);
        const regex = /^010-\d{4}-\d{4}$/;
        if (value && !regex.test(value)) setContactError("010-xxxx-xxxx 형식으로 입력해주세요");
        else setContactError("");
    };

    const handleUpdateInfo = async () => {
        const fullEmail = `${emailId.trim()}@${emailDomain.trim()}`;

        // 이메일 변경 시 인증 완료 체크
        if (fullEmail !== email && !isEmailCertified) {
            return alert("이메일을 변경하셨다면 인증을 완료해야 합니다.");
        }

        if (contactError) return alert("연락처 형식을 확인해주세요.");

        try {
            const dataToSend = {
                email: fullEmail.trim() ? fullEmail : email,
                post: editPost.trim() ? editPost : post,
                address1: editAddress1.trim() ? editAddress1 : address1,
                address2: editAddress2.trim() ? editAddress2 : address2,
                contact: editContact.trim() ? editContact : contact
            };

            await axios.put(`http://localhost:8080/member/${loginNo}`, dataToSend, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            alert("회원정보가 업데이트되었습니다.");
            setIsEditing(false);

            // 로그인 상태 및 편집 상태 업데이트
            setLoginEmail(dataToSend.email);
            setEditEmail(dataToSend.email);
            const [id, domain] = dataToSend.email.split("@");
            setEmailId(id);
            setEmailDomain(domain);
            setLoginPost(dataToSend.post);
            setLoginAddress1(dataToSend.address1);
            setLoginAddress2(dataToSend.address2);
            setLoginContact(dataToSend.contact);
            // 이메일 변경 후 인증 초기화
            if (fullEmail !== email) {
                setIsEmailCertified(false);
                setCertNumber("");
                setCertNumberClass("");
                setCertNumberFeedback("");
            }

        } catch (error) {
            console.error(error);
            alert("회원정보 수정 중 오류가 발생했습니다.");
        }
    };
    // 현재 비밀번호와 같은지 검사(규칙과 함께)
    const handleNewPasswordChange = (value) => {
        setNewPassword(value);

        if (value.length === 0) {
            setNewPasswordValid(null);
        } else {
            setNewPasswordValid(passwordRegex.test(value));
        }
        if (value === currentPassword && value.length > 0) {
            setIsSameAsCurrent(true);
        } else {
            setIsSameAsCurrent(false);
        }
    };

    const [confirmValid, setConfirmValid] = useState(null);

    const handleConfirmChange = (value) => {
        setNewPasswordConfirm(value);

        if (value.length === 0) {
            setConfirmValid(null);
            return;
        }
        setConfirmValid(newPassword === value);
    };
    const forceLogout = useCallback(async (reasonText = "보안을 위해 다시 로그인해주세요.") => {
        // 1) jotai 상태 초기화
        clearLogin(); // 너가 이미 쓰는 clearLoginState atom

        // 2) axios 기본 헤더 제거
        delete axios.defaults.headers.common["Authorization"];

        // 3) localStorage 토큰 제거
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        // 4) 알림 + 이동
        await Swal.fire({
            icon: "info",
            title: "다시 로그인 필요",
            text: reasonText,
            timer: 2200,
            showConfirmButton: false,
        });

        // 5) 로그인 페이지로 이동(원하면)
        window.location.href = "/member/login";
    }, [clearLogin]);



    const handlePasswordChange = async () => {
        // 1) 비어 있는지 체크
        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            return Swal.fire({
                icon: "warning",
                title: "입력 오류",
                text: "현재 비밀번호와 새 비밀번호, 비밀번호 확인을 모두 입력해주세요.",
                timer: 2000,
                showConfirmButton: false
            });
        }

        // 2) 새 비밀번호 규칙 검사
        if (!passwordRegex.test(newPassword)) {
            return Swal.fire({
                icon: "error",
                title: "비밀번호 규칙 불일치",
                html: `
                <div style="text-align:left">
                    <b>비밀번호 규칙:</b><br>
                    - 8~16자<br>
                    - 대문자 포함<br>
                    - 소문자 포함<br>
                    - 숫자 포함<br>
                    - 특수문자(!@#$) 포함
                </div>
            `,
                timer: 3000,
                showConfirmButton: false
            });
        }

        // 3) 새 비밀번호와 확인 일치 여부
        if (newPassword !== newPasswordConfirm) {
            return Swal.fire({
                icon: "error",
                title: "불일치",
                text: "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.",
                timer: 2500,
                showConfirmButton: false
            });
        }

        // 4) 새 비밀번호가 현재 비밀번호와 같은지 체크 (프론트에서도 한 번 막기)
        if (newPassword === currentPassword) {
            return Swal.fire({
                icon: "error",
                title: "비밀번호 재사용 불가",
                text: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
                timer: 2500,
                showConfirmButton: false
            });
        }
        try {
            const response = await axios.put(
                `http://localhost:8080/member/changePassword/${loginNo}`,
                {
                    currentPw: currentPassword, // 현재 비밀번호
                    newPw: newPassword          // 새 비밀번호
                },
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );

            Swal.fire({
                icon: "question",
                title: "비밀번호 변경 성공",
                text: "비밀번호가 정상적으로 변경되었습니다.",
                timer: 2000,
                showConfirmButton: false
            });

            // 모달 닫고 입력값/검사값 초기화
            setIsPasswordModalOpen(false);
            setCurrentPassword("");
            setNewPassword("");
            setNewPasswordConfirm("");
            setNewPasswordValid(null);
            setConfirmValid(null);
            forceLogout("비밀번호가 변경되어 로그아웃되었습니다. 다시 로그인해주세요.");

        } catch (err) {
            console.error(err);

            const msg = err.response?.data || "비밀번호 변경 중 문제가 발생했습니다.";

            Swal.fire({
                icon: "error",
                title: "오류 발생",
                text: msg,
                timer: 2500,
                showConfirmButton: false
            });
        }
    };
const handleDeleteAccount = async () => {
  if (!password) {
    return Swal.fire({
      icon: "warning",
      title: "입력 오류",
      text: "현재 비밀번호를 입력해주세요.",
      timer: 1800,
      showConfirmButton: false,
    });
  }

  const ok = await Swal.fire({
    icon: "warning",
    title: "회원 탈퇴",
    text: "정말 탈퇴하시겠습니까? 계정은 복구할 수 없습니다.",
    showCancelButton: true,
    confirmButtonText: "탈퇴",
    cancelButtonText: "취소"
  });

  if (!ok.isConfirmed) return;

  try {
    await axios.delete(`http://localhost:8080/member/${loginNo}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { pw: password }, 
    });

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete axios.defaults.headers.common["Authorization"];
    clearLogin(); // jotai 초기화
    navigete("/member/login")

    Swal.fire({
      icon: "success",
      title: "탈퇴 완료",
      text: "이용해주셔서 감사합니다.",
      timer: 1800,
      showConfirmButton: false,
    });

  } catch (err) {
    const msg = err.response?.data || "회원 탈퇴 중 오류가 발생했습니다.";
    Swal.fire({ icon: "error", title: "실패", text: msg });
  }
};

    return (
        <>
            <Jumbotron
                subject="마이페이지"
                detail="회원 정보를 확인하고 관리할 수 있습니다."
            />

            <div className="member-container mx-auto mt-5 p-4" style={{ maxWidth: "1400px", width: "100%" }}>
                <div className="row g-4">

                    {/* 회원 정보 카드 */}
                    <div className="col-md-8">
                        <div className="card shadow-sm p-4 h-100">
                            <h4 className="mb-3" style={{ fontWeight: "bold" }}>회원 정보</h4>

                            {/* 기본 정보 */}
                            <div className="mb-2 mt-2">
                                <div className="mb-2"><strong>아이디:</strong> {loginId}</div>
                                <div className="mb-2"><strong>닉네임:</strong> {nickname}</div>
                                <div className="mb-2"><strong>권한:</strong> {loginRole}</div>
                            </div>

                            <div className="mb-2 mt-2">
                                <strong>이메일:</strong>
                                {isEditing ? (
                                    <div className="d-flex flex-column mt-1">
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control flex-grow-1"
                                                placeholder="아이디"
                                                value={emailId}
                                                onChange={e => {
                                                    const value = e.target.value;
                                                    setEmailId(value);
                                                    const fullEmail = `${value.trim()}@${emailDomain.trim()}`;
                                                    if (fullEmail !== email) {
                                                        setIsEmailCertified(false);
                                                    }
                                                    checkMemberEmail();
                                                }}
                                            />
                                            <span className="input-group-text">@</span>
                                            <input
                                                type="text"
                                                className="form-control flex-grow-2"
                                                placeholder="도메인"
                                                value={emailDomain}
                                                onChange={e => {
                                                    const value = e.target.value;
                                                    setEmailDomain(value);

                                                    const fullEmail = `${emailId.trim()}@${value.trim()}`;
                                                    if (fullEmail !== email) {
                                                        setIsEmailCertified(false);
                                                    }
                                                    checkMemberEmail();
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                onClick={sendCertEmail}
                                                disabled={sending === true || memberClass.email === "is-invalid"}
                                            >
                                                {sending === true ? "발송중..." : "인증번호 전송"}
                                            </button>
                                        </div>

                                        {(sending === false || isEmailCertified) && (
                                            <>
                                                <div className="d-flex justify-content-center gap-2 mt-2">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        className={`form-control w-auto ${certNumberClass}`}
                                                        placeholder="인증번호 입력"
                                                        value={certNumber}
                                                        onChange={e => setCertNumber(e.target.value)}
                                                        disabled={isEmailCertified}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={sendCertCheck}
                                                        disabled={isEmailCertified}
                                                    >
                                                        인증번호 확인
                                                    </button>
                                                </div>
                                                {certNumberClass === "is-valid" && (
                                                    <div className="valid-feedback d-block mt-2">
                                                        인증번호 확인이 완료되었습니다.
                                                    </div>
                                                )}

                                                {certNumberClass === "is-invalid" && certNumberFeedback && (
                                                    <div className="invalid-feedback d-block mt-2">
                                                        {certNumberFeedback}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <span className="ms-2">{editEmail}</span>
                                )}
                            </div>

                            {/* 주소 */}
                            <div className="mb-2 mt-2">
                                <div className="mb-2 ">
                                    <strong>우편번호:</strong>
                                    {isEditing ? (
                                        <div className="d-flex justify-content-center align-items-center gap-2 mt-2 w-100">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm w-25"
                                                value={editPost}
                                                readOnly
                                            />
                                            <button
                                                className="btn btn-primary btn-sm "
                                                onClick={searchAddress}
                                            >
                                                <FaMagnifyingGlass />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={clearAddress}
                                            >
                                                <FaEraser />
                                            </button>
                                        </div>

                                    ) : (
                                        <span className="ms-2">{post}</span>
                                    )}
                                </div>

                                <div className="mb-2">
                                    <strong>기본 주소:</strong>
                                    {isEditing ? (
                                        <div className="d-flex justify-content-center gap-2 mt-2">
                                            <input type="text" className="form-control mt-1" value={editAddress1} readOnly /></div>
                                    ) : <span className="ms-2">{address1}</span>}
                                </div>
                                <div className="mb-2">
                                    <strong>상세 주소:</strong>
                                    {isEditing ? (
                                        <div className="d-flex justify-content-center gap-2 mt-2">
                                            <input type="text" className="form-control mt-1" value={editAddress2} onChange={(e) => setEditAddress2(e.target.value)} />
                                        </div>
                                    ) : <span className="ms-2">{address2}</span>}
                                </div>
                            </div>

                            {/* 연락처 */}
                            <div className="mb-2 mt-2">
                                <div className="mb-2">
                                    <strong>연락처:</strong>
                                    {isEditing ? (
                                        <div className="d-flex justify-content-center gap-2 mt-2">
                                            <input
                                                type="text"
                                                className={`form-control mt-1 ${contactError ? "is-invalid" : ""}`}
                                                value={editContact}
                                                onChange={(e) => handleContactChange(e.target.value)}
                                            /></div>
                                    ) : <span className="ms-2">{contact}</span>}
                                    {contactError && <div className="invalid-feedback">{contactError}</div>}
                                </div>
                            </div>

                            {/* 기타 정보 */}
                            <div className="mb-2 mt-2">
                                <div className="mb-2"><strong>보유 머니:</strong> {point}p</div>
                                <div className="mb-2 mt-1"><strong>가입일:</strong> {createdTime ? new Date(createdTime).toLocaleDateString("ko-KR") : "-"}</div>
                            </div>

                            {isEditing && (
                                <div className="d-flex justify-content-end gap-2 mt-2">
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditEmail(email);
                                            setEditPost(post);
                                            setEditAddress1(address1);
                                            setEditAddress2(address2);
                                            setEditContact(contact);
                                            setIsEmailVerified(false);
                                            setContactError("");
                                        }}
                                    >취소</button>
                                    <button className="btn btn-primary btn-sm" onClick={handleUpdateInfo}>저장</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 계정 관리 */}
                    <div className="col-md-4">
                        <div className="card shadow-lg p-4 rounded-3">
                            <h5 className="mb-3 text-center fw-bold text-primary">계정 관리</h5>

                            <div className="mb-3">
                                <button className="btn btn-outline-primary w-80 mt-2 py-1 rounded-pill shadow-sm hover-shadow" onClick={() => setIsEditing(true)}>
                                    <FaUserPen className="me-2" /> 회원정보 변경
                                </button>
                            </div>

                            <div className="mb-3">
                                <button
                                    className="btn btn-outline-primary w-80 mt-2 py-1 rounded-pill shadow-sm hover-shadow"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                >
                                    <FaUserLock className="me-2" /> 비밀번호 변경
                                </button>
                            </div>

                            <div className="mb-3">
                                <button className="btn btn-outline-danger w-50 mt-4 py-1 rounded-pill shadow-sm hover-shadow" onClick={() => setShowDeletePanel(!showDeletePanel)}>
                                    <FaTrash className="me-2" /> 회원 탈퇴
                                </button>
                            </div>

                            {showDeletePanel && (
                                <div className="mt-3 bg-light p-4 rounded-3 border fadeInEffect">
                                    <div className="mb-3 text-danger fw-semibold fs-6">
                                        <FaExclamationTriangle className="me-1" /> 회원 탈퇴 시 <br></br>계정은 복구할 수 없습니다.
                                    </div>
                                    <input
                                        type="password"
                                        className="form-control mb-3 py-2 w-100"
                                        placeholder="현재 비밀번호를 입력하세요"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div className="d-flex gap-2 justify-content-end">
                                        <button className="btn btn-secondary btn-sm" onClick={() => { setPassword(""); setShowDeletePanel(false); }}>취소</button>
                                        <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>탈퇴하기</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 기타 정보 */}
                    <div className="col-12">
                        <div className="card shadow-sm p-4">
                            <h5 className="mb-3">기타 정보</h5>
                            <div>최근 문의내역, 상품 즐겨찾기, 충전 등 추가 기능을 여기에 표시</div>
                        </div>
                    </div>
                    {isPasswordModalOpen && (
                        <div
                            className="modal-backdrop-custom"
                            onClick={() => setIsPasswordModalOpen(false)}
                        ></div>
                    )}
                    {/* 비밀번호 변경 모달 */}
                    {isPasswordModalOpen && (
                        <div
                            className="modal fade show"
                            style={{ display: "block" }}
                            id="passwordChangeModal"
                            tabIndex="-1"
                            aria-labelledby="passwordChangeModalLabel"
                            aria-hidden="true"
                        >
                            <div
                                className="modal-dialog modal-dialog-centered password-modal-dialog"
                            >
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title block-title" id="passwordChangeModalLabel">
                                            비밀번호 변경
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            aria-label="Close"
                                            onClick={() => {
                                                setIsPasswordModalOpen(false);
                                                setCurrentPassword("");
                                                setNewPassword("");
                                                setNewPasswordConfirm("");
                                            }}
                                        ></button>
                                    </div>

                                    <div className="modal-body text-center">
                                        {/* 현재 비밀번호 */}
                                        <div className="mb-3">
                                            <label htmlFor="currentPassword" className="form-label fw-bold">
                                                현재 비밀번호
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control mx-auto"
                                                style={{ maxWidth: "250px" }}
                                                id="currentPassword"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                        </div>
                                        <hr className="my-4" />
                                        {/* 새 비밀번호 */}
                                        <div className="mb-3">
                                            <label htmlFor="newPassword" className="form-label fw-bold">새 비밀번호</label>
                                            <input
                                                type="password"
                                                className={`form-control mx-auto ${newPasswordValid === false ? "is-invalid" : newPasswordValid === true ? "is-valid" : ""}`}
                                                style={{ maxWidth: "250px" }}
                                                id="newPassword"
                                                value={newPassword}
                                                onChange={(e) => handleNewPasswordChange(e.target.value)}
                                            />
                                            {isSameAsCurrent && (
                                                <div className="invalid-feedback">
                                                    새 비밀번호는 현재 비밀번호와 다르게 입력해야 합니다.
                                                </div>
                                            )}
                                            {newPasswordValid === false && (
                                                <div className="invalid-feedback">
                                                    8~16자, 대문자·소문자·숫자·특수문자(!@#$)를 모두 포함해야 합니다.
                                                </div>
                                            )}
                                            {newPasswordValid === true && (
                                                <div className="valid-feedback">
                                                    사용 가능한 비밀번호입니다.
                                                </div>
                                            )}
                                        </div>
                                        {/* 새 비밀번호 확인 */}
                                        <div className="mb-3">
                                            <label htmlFor="confirmNewPassword" className="form-label fw-bold text-red">새 비밀번호 확인</label>
                                            <input
                                                type="password"
                                                className={`form-control mx-auto ${confirmValid === false ? "is-invalid" : confirmValid === true ? "is-valid" : ""}`}
                                                style={{ maxWidth: "250px" }}
                                                id="confirmNewPassword"
                                                value={newPasswordConfirm}
                                                onChange={(e) => handleConfirmChange(e.target.value)}
                                            />
                                            {confirmValid === false && (
                                                <div className="invalid-feedback">
                                                    비밀번호가 일치하지 않습니다.
                                                </div>
                                            )}
                                            {confirmValid === true && (
                                                <div className="valid-feedback">
                                                    비밀번호가 일치합니다.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setIsPasswordModalOpen(false);
                                                setCurrentPassword("");
                                                setNewPassword("");
                                                setNewPasswordConfirm("");
                                            }}
                                        >
                                            취소
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handlePasswordChange}
                                        >
                                            변경
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
