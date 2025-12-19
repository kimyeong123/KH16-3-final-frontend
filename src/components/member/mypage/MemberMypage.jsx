import { useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { Link, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { FaTrash, FaUserLock, FaEnvelope, FaEraser, FaExclamationTriangle } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaUserPen } from "react-icons/fa6";
import {
    loginNoState, loginIdState, loginRoleState, loginNicknameState, loginPostState,
    loginAddress1State, loginAddress2State, loginEmailState,
    loginPointState, loginContactState, loginCreatedTimeState,
    clearLoginState, accessTokenState
} from "../../../utils/jotai";
import Jumbotron from "../../templates/Jumbotron";
import axios from "axios";
import "../Member.css";
import "../../../styles/sweetalert2-flatly.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import PasswordChangeModal from "./modals/PasswordChangeModal";
import ChargeHistoryModal from "./modals/ChargeHistoryModal";
import BidHistoryModal from "./modals/BidHistoryModal";
import MemberInfoCard from "./sections/MemberInfoCard";


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
    const [point, setLoginPoint] = useAtom(loginPointState);
    const [contact, setLoginContact] = useAtom(loginContactState);
    const [createdTime] = useAtom(loginCreatedTimeState);


    const navigete = useNavigate();

    const [accessToken] = useAtom(accessTokenState);
    const [, clearLogin] = useAtom(clearLoginState);
    // 충전 내역을 위한 상태
    const [chargeHistory, setChargeHistory] = useState([]);
    // 입찰 내역을 위한 상태
    const [bidHistory, setBidHistory] = useState([]);
    // 비밀번호 변경을 위한 상태
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [onlyBidding, setOnlyBidding] = useState(true);

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

    const { memberNo: paramNo } = useParams();
    const isViewAs = !!paramNo;
    const targetNo = isViewAs ? Number(paramNo) : loginNo;
    const [viewMember, setViewMember] = useState(null);
    const view = isViewAs ? viewMember : {
        id: loginId,
        nickname,
        role: loginRole,
        post,
        address1,
        address2,
        contact,
        point,
        createdTime,
        email
    };
    const filtered = onlyBidding
        ? bidHistory.filter(b => (b.status ?? "").toLowerCase() === "bidding")
        : bidHistory;
    const isAdmin = loginRole === "ADMIN";
    //자기 자신이 다른 사람의 마이페이지를 볼 때
    console.log("paramNo =", paramNo);
    useEffect(() => {
        if (!accessToken) return;

        const url = (loginRole === "ADMIN" && paramNo)
            ? `/admin/members/detail/${Number(paramNo)}`
            : `/member/mypage`;

        axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
        }).then(resp => {
            setViewMember(resp.data);
        }).catch(e => {
            console.error(e.response?.status, e.response?.data);
        });
    }, [loginRole, paramNo, accessToken]);

    useEffect(() => {
        const load = async () => {
            const authHeader = axios.defaults.headers.common["Authorization"];
            const { data } = await axios.get("/member/mypage", {
                headers: { Authorization: authHeader }
            });

            setLoginPoint(data.point);
        };
        load();
    }, []);

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
    //충전내역
    useEffect(() => {
        const loadChargeHistory = async () => {
            try {
                const url = isViewAs
                    ? `/admin/members/${targetNo}/point/charge`
                    : `/member/point/charged-history`;

                const resp = await axios.get(url, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setChargeHistory(resp.data);
            } catch (e) {
                console.error(e);
                setChargeHistory([]);
            }
        };

        if (accessToken && (!isViewAs || viewMember)) loadChargeHistory();
    }, [accessToken, isViewAs, targetNo, viewMember]);

    //입찰내역
    useEffect(() => {
        const loadBidHistory = async () => {
            try {
                const url = isViewAs
                    ? `/admin/members/${targetNo}/bid/history`
                    : `/member/bid/history`;

                const resp = await axios.get(url, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setBidHistory(resp.data);
            } catch (e) {
                console.error(e);
                setBidHistory([]);
            }
        };

        if (accessToken && (!isViewAs || viewMember)) loadBidHistory();
    }, [accessToken, isViewAs, targetNo, viewMember]);


    // 주소 검색
    const openPostcode = useDaumPostcodePopup();
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
    // 현재 비밀번호와 같은지 검사
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
        clearLogin(); // 

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

        // 5) 로그인 페이지로 이동
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
        // 4) 새 비밀번호가 현재 비밀번호와 같은지 체크
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
    const handleAdminDeleteMember = async () => {
        const result = await Swal.fire({
            icon: "warning",
            title: "회원 삭제",
            text: "정말 삭제하시겠습니까? (되돌릴 수 없습니다)",
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText: "취소",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`/member/admin/${targetNo}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            await Swal.fire({
                icon: "success",
                title: "삭제 완료",
                text: "회원이 삭제되었습니다.",
                timer: 1600,
                showConfirmButton: false,
            });

            navigete("/admin/home/member");
        } catch (err) {
            const msg = err.response?.data || "회원 삭제 중 오류가 발생했습니다.";
            Swal.fire({ icon: "error", title: "삭제 실패", text: msg });
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
                    <MemberInfoCard
                        view={view}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        isViewAs={isViewAs}
                        editEmail={editEmail}
                        email={email}
                        emailId={emailId}
                        setEmailId={setEmailId}
                        emailDomain={emailDomain}
                        setEmailDomain={setEmailDomain}
                        isEmailCertified={isEmailCertified}
                        setIsEmailCertified={setIsEmailCertified}
                        sending={sending}
                        memberClass={memberClass}
                        certNumberClass={certNumberClass}
                        certNumber={certNumber}
                        setCertNumber={setCertNumber}
                        certNumberFeedback={certNumberFeedback}
                        sendCertEmail={sendCertEmail}
                        sendCertCheck={sendCertCheck}
                        checkMemberEmail={checkMemberEmail}
                        editPost={editPost}
                        editAddress1={editAddress1}
                        editAddress2={editAddress2}
                        setEditAddress2={setEditAddress2}
                        searchAddress={searchAddress}
                        clearAddress={clearAddress}
                        editContact={editContact}
                        handleContactChange={handleContactChange}
                        contactError={contactError}
                        post={post}
                        address1={address1}
                        address2={address2}
                        contact={contact}
                        setEditEmail={setEditEmail}
                        setEditPost={setEditPost}
                        setEditAddress1={setEditAddress1}
                        setEditContact={setEditContact}
                        setIsEmailVerified={setIsEmailVerified}
                        setContactError={setContactError}
                        handleUpdateInfo={handleUpdateInfo}
                    />

                    {/* 계정 관리 */}
                    <div className="col-md-5">
                        <div className="card shadow-lg rounded-3 overflow-hidden">
                            <div className="mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="fw-bold fs-5 text-dark">
                                        계정 관리
                                    </div>
                                    <div
                                        style={{
                                            flex: 1,
                                            height: 1,
                                            backgroundColor: "#e5e7eb"
                                        }}
                                    />  
                                </div>
                                {!isViewAs && (
                                <div className="small text-muted mt-1">
                                    내 정보 수정 · 보안
                                </div>)}
                            </div>



                            <div className="p-4">

                                {/* 메뉴형 액션 리스트 */}
                                {!isViewAs && (
                                    <div className="d-grid gap-2">

                                        {/* 회원정보 변경 */}
                                        <div
                                            className="d-flex align-items-center justify-content-center p-3 rounded"
                                            style={{
                                                background: "#f9fafb",
                                                border: "1px solid #eef1f4",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => setIsEditing(true)}
                                            role="button"
                                        >
                                            <FaUserPen className="me-3 text-primary fs-5" />
                                            <div className="text-center">
                                                <div className="fw-semibold">회원정보 변경</div>
                                                <div className="text-muted small">이메일 · 연락처 · 주소 수정</div>
                                            </div>
                                        </div>

                                        {/* 비밀번호 변경 */}
                                        <div
                                            className="d-flex align-items-center justify-content-center p-3 rounded"
                                            style={{
                                                background: "#f9fafb",
                                                border: "1px solid #eef1f4",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => setIsPasswordModalOpen(true)}
                                            role="button"
                                        >
                                            <FaUserLock className="me-3 text-primary fs-5" />
                                            <div className="text-center">
                                                <div className="fw-semibold">비밀번호 변경</div>
                                                <div className="text-muted small">보안을 위해<br></br> 주기적으로 변경하세요</div>
                                            </div>
                                        </div>


                                    </div>
                                )}

                                {/* 위험 영역 */}
                                <hr className="my-4" />
                                <div className="text-muted small mb-3">
                                    회원 정보는 되돌릴 수 없습니다. <br />신중하게 진행해주세요.
                                </div>

                                {/* 일반 회원: 회원 탈퇴 */}
                                {!isViewAs && (
                                    <>
                                        <div className="d-flex justify-content-center">
                                            <button
                                                className="btn btn-outline-danger rounded-pill px-4"
                                                onClick={() => setShowDeletePanel(!showDeletePanel)}
                                            >
                                                <FaTrash className="me-2" />
                                                회원 탈퇴
                                            </button>
                                        </div>

                                        {showDeletePanel && (
                                            <div className="mt-3 bg-light p-4 rounded-3 border">
                                                <div className="mb-3 text-danger fw-semibold">
                                                    <FaExclamationTriangle className="me-1" />
                                                    회원 탈퇴 시 계정은 복구할 수 없습니다.
                                                </div>

                                                <input
                                                    type="password"
                                                    className="form-control mb-3 py-2"
                                                    placeholder="현재 비밀번호를 입력하세요"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />

                                                <div className="d-flex gap-2 justify-content-end">
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => {
                                                            setPassword("");
                                                            setShowDeletePanel(false);
                                                        }}
                                                    >
                                                        취소
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>
                                                        탈퇴하기
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                {/* 관리자: 회원 삭제 */}
                                {isViewAs && isAdmin && (
                                    <div className="d-flex justify-content-center">
                                        <button
                                            className="btn btn-danger rounded-pill px-4"
                                            onClick={handleAdminDeleteMember}
                                        >
                                            <FaTrash className="me-2" />
                                            회원 삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 기타 정보 */}
                    <div className="col-12">
                        <div className="card shadow-sm p-4">
                            <div className="d-flex align-items-center gap-2 mb-3 mt-4">
                                <div
                                    style={{
                                        width: 6,
                                        height: 22,
                                        backgroundColor: "#2C3E50",
                                        borderRadius: 3
                                    }}
                                />
                                <h5 className="mb-0 fw-bold" style={{ color: "#2C3E50" }}>
                                    기타 정보
                                </h5>
                            </div>

                            {/* 포인트 충전 내역 */}
                            <div
                                className="d-flex align-items-center justify-content-between px-3 py-3 mb-2 rounded"
                                style={{ background: "#f9fafb", border: "1px dashed #dee2e6", cursor: "pointer" }}
                                data-bs-toggle="modal"
                                data-bs-target="#chargeHistoryModal"
                            >
                                <div className="info-text">
                                    <div className="fw-semibold fs-5">포인트 충전 내역</div>
                                    <div className="text-secondary small">최근 충전한 내역 10건까지 제공</div>
                                </div>
                            </div>

                            {/* 입찰 내역 */}
                            <div
                                className="d-flex align-items-center justify-content-between px-3 py-3 mb-2 rounded"
                                style={{ background: "#f9fafb", border: "1px dashed #dee2e6", cursor: "pointer" }}
                                data-bs-toggle="modal"
                                data-bs-target="#bidHistoryModal"
                            >
                                <div className="info-text">
                                    <div className="fw-semibold fs-5">입찰 내역</div>
                                    <div className="text-secondary small">입찰한 상품 {bidHistory.length}개</div>
                                </div>
                            </div>
                            {/* 문의 내역 */}
                            {/* 등록한 물품 */}
                        </div>
                    </div>
                    {/*모달 영역 */}
                    <PasswordChangeModal
                        isOpen={isPasswordModalOpen}
                        onClose={() => setIsPasswordModalOpen(false)}
                        currentPassword={currentPassword}
                        setCurrentPassword={setCurrentPassword}
                        newPassword={newPassword}
                        newPasswordConfirm={newPasswordConfirm}
                        newPasswordValid={newPasswordValid}
                        confirmValid={confirmValid}
                        isSameAsCurrent={isSameAsCurrent}
                        handleNewPasswordChange={handleNewPasswordChange}
                        handleConfirmChange={handleConfirmChange}
                        handlePasswordChange={handlePasswordChange}
                        setNewPassword={setNewPassword}
                        setNewPasswordConfirm={setNewPasswordConfirm}
                    />

                    <ChargeHistoryModal
                        chargeHistory={chargeHistory}
                    />
                    <BidHistoryModal
                        bidHistory={bidHistory}
                        onlyBidding={onlyBidding}
                        setOnlyBidding={setOnlyBidding}
                        filtered={filtered}
                    />
                </div>
            </div>
        </>
    );
}
