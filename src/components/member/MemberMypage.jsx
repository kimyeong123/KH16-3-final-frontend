import { useAtom } from "jotai";
import { FaKey, FaTrash } from "react-icons/fa";
import { 
    loginNoState, loginIdState, loginRoleState, loginNicknameState,
    loginAddress1State, loginAddress2State, loginEmailState,
    loginPointState, loginContactState, loginCreatedTimeState,
    clearLoginState, accessTokenState, refreshTokenState
} from "../../utils/jotai";
import Jumbotron from "../templates/Jumbotron";
import axios from "axios";

export default function MemberMypage() {
    // 로그인 관련 상태
    const [loginNo, setLoginNo] = useAtom(loginNoState);
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginRole, setLoginRole] = useAtom(loginRoleState);
    const [nickname, setNickname] = useAtom(loginNicknameState);
    const [email, setEmail] = useAtom(loginEmailState);
    const [address1, setAddress1] = useAtom(loginAddress1State);
    const [address2, setAddress2] = useAtom(loginAddress2State);
    const [point, setPoint] = useAtom(loginPointState);
    const [contact, setContact] = useAtom(loginContactState);
    const [createdTime, setCreatedTime] = useAtom(loginCreatedTimeState);

    // 토큰 상태
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const [refreshToken, setRefreshToken] = useAtom(refreshTokenState);

    // 로그인 상태 초기화 함수
    const [, clearLogin] = useAtom(clearLoginState);

    // 탈퇴 처리 함수
    const handleDeleteAccount = async () => {
        if (!window.confirm("정말 회원 탈퇴를 진행하시겠습니까?")) return;

        try {
            if (!loginNo) {
                alert("회원 번호가 존재하지 않습니다.");
                return;
            }

            await axios.delete(`http://localhost:8080/member/${Number(loginNo)}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            // Jotai 상태 초기화
            clearLogin(); // 로그인 관련 모든 상태 초기화

            alert("회원 탈퇴가 완료되었습니다. 로그인 상태가 만료되었습니다.");
            window.location.href = "/";

        } catch (error) {
            console.error(error);
            alert("회원 탈퇴 중 오류가 발생했습니다.");
        }
    };

    return (
        <>
            <Jumbotron subject="마이페이지" detail="회원 정보를 확인하고 관리할 수 있습니다." />

            <div className="member-container mx-auto mt-5 p-4">
                <h3 className="mb-4">환영합니다, <span className="text-info">{nickname || loginId}</span>님!</h3>

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
                                <strong>가입일:</strong>{" "}
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
                        <div className="card shadow-sm p-4 h-100">
                            <h5 className="mb-3">계정 관리</h5>
                            <button className="btn btn-outline-primary w-100 mb-2 d-flex align-items-center justify-content-center">
                                <FaKey className="me-2" /> 비밀번호 변경
                            </button>
                            <button 
                                className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                                onClick={handleDeleteAccount}
                            >
                                <FaTrash className="me-2" /> 회원 탈퇴
                            </button>
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
