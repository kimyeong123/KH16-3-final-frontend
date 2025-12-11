    import { useCallback, useEffect, useState } from "react";
    import { useAtom } from "jotai";
    import { useDaumPostcodePopup } from "react-daum-postcode";
    import { FaTrash, FaUserLock, FaEnvelope, FaEraser } from "react-icons/fa";
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

    export default function MemberMypage() {
        const [loginNo] = useAtom(loginNoState);
        const [loginId] = useAtom(loginIdState);
        const [loginRole] = useAtom(loginRoleState);
        const [nickname] = useAtom(loginNicknameState);
        const [email, setLoginEmail] = useAtom(loginEmailState);
        const [post, setLoginPost] = useAtom(loginPostState);
        const [address1, setLoginAddress1] = useAtom(loginAddress1State);
        const [address2] = useAtom(loginAddress2State);
        const [point] = useAtom(loginPointState);
        const [contact, setLoginContact] = useAtom(loginContactState);
        const [createdTime] = useAtom(loginCreatedTimeState);

        const [accessToken] = useAtom(accessTokenState);
        const [, clearLogin] = useAtom(clearLoginState);

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
        const [memberClass, setMemberClass] = useState({ memberEmail: "" }); // 이메일 유효성 클래스
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
                memberEmail: isEmailCertified ? "is-valid" : valid ? "is-valid" : "is-invalid"
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
                    setMemberClass(prev => ({ ...prev, memberEmail: "is-valid" }));
                    setCertNumberClass("is-valid");
                    setCertNumberFeedback("인증번호 확인이 완료되었습니다.");
                } else {
                    setCertNumberClass("is-invalid");
                    setCertNumberFeedback(response.data.message || "인증번호가 일치하지 않습니다.");
                }
            } catch (error) {
                console.error("인증번호 확인 오류:", error);
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

        const handleDeleteAccount = async () => {
            if (!password) return alert("비밀번호를 입력해주세요.");
            try {
                if (!loginNo) return alert("회원 번호가 존재하지 않습니다.");
                await axios.delete(`http://localhost:8080/member/${Number(loginNo)}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    data: { memberPw: password }
                });
                clearLogin();
                alert("회원 탈퇴가 완료되었습니다. 로그인 상태가 만료되었습니다.");
                setShowDeletePanel(false);
                window.location.href = "/";
            } catch (error) {
                console.error(error);
                if (error.response?.status === 401) alert("비밀번호가 올바르지 않습니다.");
                else if (error.response?.status === 403) alert("본인 계정만 탈퇴할 수 있습니다.");
                else alert("회원 탈퇴 중 오류가 발생했습니다.");
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
                                                    className="form-control flex-grow-1" // 입력창이 더 많은 공간을 차지
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
                                                    className="form-control flex-grow-2" // 도메인 입력창도 더 많은 공간을 차지
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
                                                    className="btn btn-primary btn-sm" // 버튼 크기 줄이기
                                                    onClick={sendCertEmail}
                                                    disabled={sending === true || memberClass.memberEmail === "is-invalid"}
                                                >
                                                    {sending === true ? "발송중..." : "인증번호 전송"}
                                                </button>
                                            </div>


                                            {(sending === false || isEmailCertified) && (
                                                <div className="d-flex justify-content-center gap-2 mt-2">
                                                    <input
                                                        type="text"
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
                                                        확인
                                                    </button>

                                                    {certNumberClass === "is-valid" && (
                                                        <div className="valid-feedback d-block">완료</div>
                                                    )}
                                                    <div className="invalid-feedback">{certNumberFeedback}</div>
                                                </div>
                                            )}

                                            <div className="invalid-feedback">{memberEmailFeedback}</div>
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
                                    <button className="btn btn-outline-primary w-80 mb-3 py-1 rounded-pill shadow-sm hover-shadow" onClick={() => setIsEditing(true)}>
                                        <FaUserPen className="me-2" /> 회원정보 변경
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <button className="btn btn-outline-primary w-80 mb-3 py-1 rounded-pill shadow-sm hover-shadow">
                                        <FaUserLock className="me-2" /> 비밀번호 변경
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <button className="btn btn-outline-danger w-50 mb-3 py-1 rounded-pill shadow-sm hover-shadow" onClick={() => setShowDeletePanel(!showDeletePanel)}>
                                        <FaTrash className="me-2" /> 회원 탈퇴
                                    </button>
                                </div>

                                {showDeletePanel && (
                                    <div className="mt-3 bg-light p-4 rounded-3 border fadeInEffect">
                                        <div className="mb-3 text-danger fw-semibold">
                                            탈퇴 시 계정은 복구할 수 없습니다.
                                        </div>
                                        <input
                                            type="password"
                                            className="form-control mb-3 py-2"
                                            placeholder="현재 비밀번호를 입력하세요"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <div className="d-flex gap-2 justify-content-end">
                                            <button className="btn btn-secondary btn-lg" onClick={() => { setPassword(""); setShowDeletePanel(false); }}>취소</button>
                                            <button className="btn btn-danger btn-lg" onClick={handleDeleteAccount}>탈퇴하기</button>
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

                    </div>
                </div>
            </>
        );
    }
