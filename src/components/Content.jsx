import { Route, Routes } from "react-router-dom";

// 공통 및 에러 처리
import Home from "./Home";
import Unauthorization from "./error/Unauthorization";

// 가드(Guard) 컴포넌트
import Private from "./guard/Private";
import Admin from "./guard/Admin";
import RequireSignupAgree from "../components/guard/RequireSignupAgree";

// 회원(Member) 관련
import MemberJoin from "./member/MemberJoin";
import MemberLogin from "./member/MemberLogin";
import MemberJoinFinish from "./member/MemberJoinFinish";
import MemberMypage from "./member/MemberMypage";

// 관리자(Admin) 관련
import AdminHome from "./admin/AdminHome";
import AdminQnaList from "./admin/AdminQnaList";
import MemberManage from "./admin/MemberManage";

// 게시판(Board) & 문의(Qna) 관련
import BoardWrite from "./board/BoardWrite";
import BoardList from "./board/BoardList";
import BoardDetail from "./board/BoardDetail";
import BoardEdit from "./board/BoardEdit";
import QnaWrite from "./qna/QnaWrite";
import QnaDetail from "./qna/QnaDetail";
import QnaMain from "./qna/QnaMain";

// 메시지(Message) 관련
import MessageList from "./message/MessageList";
import MessageDetail from "./message/MessageDetail";
import MessageWrite from "./message/MessageWrite";

// 결제(Pay) 관련
import KakaoPay from "./pay/KakaoPay";
import KakaoPaySuccess from "./pay/KakaoPaySuccess";
import KakaoPayCancel from "./pay/KakaoPayCancel";
import KakaoPayFail from "./pay/KakaoPayFail";
import Exchange from "./pay/Exchange";

// 상품(Product) 관련
import ProductAdd from "./product/ProductAdd";
import ProductAddDone from "./product/ProductAddDone";
import ProductDetail from "./product/ProductDetail";
import ProductEdit from "./product/ProductEdit";
import ProductList from "./product/ProductList";
import ProductMyList from "./product/ProductMyList";
// ▼▼▼ [새로 추가된 구매 내역 컴포넌트] ▼▼▼
import ProductPurchaseList from "./product/ProductPurchaseList"; 
import ProductAuctionList from "./product/ProductAuctionList";
import AuctionDetail from "./product/AuctionDetail";

// 기타(Etc) 약관 관련
import Terms from "./etc/Terms";
import SignupAgreement from "./etc/SignupAgreement";
import PrivacyPolicy from "./etc/PrivacyPolicy";

export default function Content() {
    return (
        <div className="row">
            <div className="col-md-10 offset-md-1">
                <Routes>
                    {/* ================= 메인 & 에러 ================= */}
                    <Route path="/" element={<Home />} />
                    <Route path="/error/403" element={<Unauthorization />} />

                    {/* ================= 회원 관련 ================= */}
                    <Route path="/signup-agreement" element={<SignupAgreement />} />
                    <Route 
                        path="/member/join" 
                        element={
                            <RequireSignupAgree>
                                <MemberJoin />
                            </RequireSignupAgree>
                        } 
                    />
                    <Route path="/member/login" element={<MemberLogin />} />
                    <Route path="/member/joinfinish" element={<MemberJoinFinish />} />
                    
                    {/* 마이페이지 */}
                    <Route path="/member/mypage" element={<Private><MemberMypage /></Private>} />
                    <Route path="/member/mypage/:memberNo" element={<MemberMypage />} />

                    {/* ================= 관리자 관련 ================= */}
                    <Route path="/admin/home" element={<Admin><AdminHome /></Admin>}>
                        <Route index element={<div>관리자 대시보드</div>} />
                        <Route path="member" element={<MemberManage />} />
                        <Route path="qnalist" element={<AdminQnaList />} />
                    </Route>

                    {/* ================= 게시판 & 문의 ================= */}
                    <Route path="/board/list" element={<BoardList />} />
                    <Route path="/board/write" element={<Admin><BoardWrite /></Admin>} />
                    <Route path="/board/:boardNo" element={<BoardDetail />} />
                    {/* (구버전 경로 호환용) */}
                    <Route path="/board/detail/:boardNo" element={<BoardDetail />} />
                    <Route path="/board/edit/:boardNo" element={<Admin><BoardEdit /></Admin>} />
                    <Route path="/board/edit" element={<BoardEdit />} />

                    <Route path="/qna/main" element={<QnaMain />} />
                    <Route path="/qna/write" element={<Private><QnaWrite /></Private>} />
                    <Route path="/qna/:boardNo" element={<QnaDetail />} />

                    {/* ================= 메시지(알림) ================= */}
                    <Route path="/message/list" element={<Private><MessageList /></Private>} />
                    <Route path="/message/write" element={<Private><MessageWrite /></Private>} />
                    <Route path="/message/:messageNo" element={<Private><MessageDetail /></Private>} />

                    {/* ================= 결제 관련 ================= */}
                    <Route path="/pay/kakaopay" element={<KakaoPay />} />
                    <Route path="/pay/exchange" element={<Exchange />} />
                    
                    {/* 카카오페이 리다이렉트 (슬래시 스타일 / CamelCase 스타일 둘 다 지원) */}
                    <Route path="/pay/kakaopay/success" element={<KakaoPaySuccess />} />
                    <Route path="/pay/kakaopay/cancel" element={<KakaoPayCancel />} />
                    <Route path="/pay/kakaopay/fail" element={<KakaoPayFail />} />
                    
                    <Route path="/pay/kakaopaySuccess" element={<KakaoPaySuccess />} />
                    <Route path="/pay/kakaopayCancel" element={<KakaoPayCancel />} />
                    <Route path="/pay/kakaopayFail" element={<KakaoPayFail />} />

                    {/* ================= 상품 관련 ================= */}
                    <Route path="/product/list" element={<ProductList />} />
                    <Route path="/product/productadd" element={<ProductAdd />} />
                    <Route path="/product/done" element={<ProductAddDone />} />
                    <Route path="/product/detail/:productNo" element={<ProductDetail />} />
                    <Route path="/product/edit/:productNo" element={<ProductEdit />} />
                    
                    {/* 내 판매 목록 */}
                    <Route path="/product/mylist" element={<Private><ProductMyList /></Private>} />

                    {/* ▼▼▼ [여기!] 내 구매/입찰 목록 (새로 만든 페이지) ▼▼▼ */}
                    <Route path="/product/purchase" element={<Private><ProductPurchaseList /></Private>} />

                    {/* 경매 리스트 및 상세 */}
                    <Route path="/product/auction/list" element={<ProductAuctionList />} />
                    <Route path="/product/auction/list/*" element={<ProductAuctionList />} />
                    <Route path="/product/auction/detail/:productNo" element={<AuctionDetail />} />

                    {/* ================= 기타 약관 ================= */}
                    <Route path="/etc/terms" element={<Terms />} />
                    <Route path="/etc/privacy" element={<PrivacyPolicy />} />
                    <Route path="/etc/signupagree" element={<SignupAgreement />} />

                    {/* ================= 404 페이지 ================= */}
                    <Route path="*" element={<div className="p-5 text-center"><h3>페이지를 찾을 수 없습니다 (404)</h3></div>} />
                </Routes>
            </div>
        </div>
    );
}