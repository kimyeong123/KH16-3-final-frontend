import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Private from "./guard/Private";
import MemberJoin from "./member/MemberJoin";
import MemberLogin from "./member/MemberLogin";
import MessageList from "./message/MessageList";
import MessageDetail from "./message/MessageDetail";
import BoardWrite from "./board/BoardWrite";
import BoardList from "./board/BoardList";
import BoardDetail from "./board/BoardDetail";
import BoardEdit from "./board/BoardEdit";
import QnaWrite from "./qna/QnaWrite";
import QnaDetail from "./qna/QnaDetail";
import MemberJoinFinish from "./member/MemberJoinFinish";
import MemberMypage from "./member/mypage/MemberMypage";
import KakaoPay from "./pay/KakaoPay";
import KakaoPaySuccess from "./pay/KakaoPaySuccess";
import KakaoPayCancel from "./pay/KakaoPayCancel";
import KakaoPayFail from "./pay/KakaoPayFail";
import ProductAdd from "./product/ProductAdd";
import ProductAddDone from "./product/ProductAddDone";
import Admin from "./guard/Admin";
import MessageWrite from "./message/MessageWrite";
import AdminHome from "./admin/AdminHome";
import MemberManage from "./admin/MemberManage";
import Unauthorization from "./error/Unauthorization";
import ProductDetail from "./product/ProductDetail";
import ProductEdit from "./product/ProductEdit";
import ProductList from "./product/ProductList";
import Exchange from "./pay/Exchange";
import ProductMyList from "./product/ProductMyList";
import ProductAuctionList from "./product/ProductAuctionList";
import AuctionDetail from "./product/AuctionDetail";
import QnaMain from "./qna/QnaMain";
import Terms from "./etc/Terms";
import SignupAgreement from "./etc/SignupAgreement";
import PrivacyPolicy from "./etc/PrivacyPolicy";
import RequireSignupAgree from "../components/guard/RequireSignupAgree";
import AdminMemberDetail from "./admin/AdminMemberDetail";
import AdminWithdrawRequests from "./admin/AdminWithdrawRequests";

export default function Content() {
  return (
    <>
      <div className="row">
        <div className="col-md-10 offset-md-1">
          <Routes>
            {/* 메인페이지 */}
            <Route path="/" element={<Home />}></Route>
            {/* 에러페이지 */}
            <Route path="/error/403" element={<Unauthorization />} />

            {/* 회원 관련 페이지들 */}

            <Route path="/signup-agreement" element={<SignupAgreement />} />
            <Route
              path="/member/join"
              element={
                <RequireSignupAgree>
                  <MemberJoin />
                </RequireSignupAgree>
              }
            />
            <Route path="/member/login" element={<MemberLogin />}></Route>
            <Route
              path="/member/joinfinish"
              element={<MemberJoinFinish />}
            ></Route>
            <Route
              path="/member/mypage"
              element={
                <Private>
                  <MemberMypage />
                </Private>
              }
            ></Route>
            <Route path="/member/mypage/:memberNo" element={<MemberMypage />} />

            <Route path="/admin/home" element={<Admin><AdminHome /></Admin>}>
              <Route index element={<div>관리자 대시보드</div>} />

              {/* 회원 관리 */}
              <Route path="member" element={<MemberManage />} />
              <Route path="member/detail/:memberNo" element={<AdminMemberDetail />} />

              {/* 출금 관리 */}
              <Route path="withdraw" element={<AdminWithdrawRequests />} />
            </Route>


            {/* 게시글 페이지(공지만) - HEAD 부분 */}
            <Route
              path="/board/write"
              element={
                <Admin>
                  <BoardWrite />
                </Admin>
              }
            ></Route>
            <Route path="/board/list" element={<BoardList />}></Route>
            <Route path="/board/:boardNo" element={<BoardDetail />}></Route>
            <Route
              path="/board/edit/:boardNo"
              element={
                <Admin>
                  <BoardEdit />
                </Admin>
              }
            ></Route>

            {/* 문의 페이지(board 재활용) - HEAD 부분 */}
            <Route
              path="/qna/write"
              element={
                <Private>
                  <QnaWrite />
                </Private>
              }
            ></Route>
            <Route path="/qna/:detail/:boardNo" element={<QnaDetail />}></Route>
            <Route path="/qna/main" element={<QnaMain />}></Route>

            {/* 메세지(알림) - HEAD 부분 */}
            <Route
              path="/message/list"
              element={
                <Private>
                  <MessageList />
                </Private>
              }
            ></Route>
            <Route
              path="/message/:messageNo"
              element={
                <Private>
                  <MessageDetail />
                </Private>
              }
            ></Route>
            <Route
              path="/message/write"
              element={
                <Private>
                  <MessageWrite />
                </Private>
              }
            ></Route>

            {/* HEAD 브랜치 결제 라우트 */}
            <Route path="/pay/kakaopay" element={<KakaoPay />} />
            <Route path="/pay/kakaopay/success" element={<KakaoPaySuccess />} />
            <Route path="/pay/kakaopay/cancel" element={<KakaoPayCancel />} />
            <Route path="/pay/kakaopay/fail" element={<KakaoPayFail />} />

            {/*  상품 등록 페이지 - HEAD 부분 */}
            <Route path="/product/productadd" element={<ProductAdd />} />
            <Route path="/product/done" element={<ProductAddDone />} />

            {/* 게시글 페이지 - origin/main 부분 (경로 중복 발생 가능) */}
            <Route
              path="board/write"
              element={
                <Private>
                  <BoardWrite />
                </Private>
              }
            ></Route>
            <Route path="board/list" element={<BoardList />}></Route>
            <Route
              path="board/detail/:boardNo"
              element={<BoardDetail />}
            ></Route>
            <Route path="board/edit" element={<BoardEdit />}></Route>

            {/* 카카오페이 - origin/main 부분 (경로 중복 발생 가능) */}
            <Route path="/pay/kakaopay" element={<KakaoPay />} />
            <Route path="/pay/kakaopaySuccess" element={<KakaoPaySuccess />} />
            <Route path="/pay/kakaopayCancel" element={<KakaoPayCancel />} />
            <Route path="/pay/kakaopayFail" element={<KakaoPayFail />} />
            <Route path="/pay/exchange" element={<Exchange />} />

            {/*  상품 등록/목록 페이지 - origin/main 부분 */}
            <Route path="/product/productadd" element={<ProductAdd />} />
            <Route path="/product/done" element={<ProductAddDone />} />
            <Route path="/product/list" element={<ProductList />} />
            <Route
              path="/product/detail/:productNo"
              element={<ProductDetail />}
            />
            <Route path="/product/edit/:productNo" element={<ProductEdit />} />
            <Route path="/product/mylist" element={<ProductMyList />} />
            <Route
              path="/product/auction/list"
              element={<ProductAuctionList />}
            />
            <Route
              path="/product/auction/detail/:productNo"
              element={<AuctionDetail />}
            />
            <Route
              path="/product/auction/list/"
              element={<ProductAuctionList />}
            />
            <Route
              path="/product/auction/list/*"
              element={<ProductAuctionList />}
            />

            {/* 기타 */}
            <Route path="etc/terms" element={<Terms />} />
            <Route path="etc/privacy" element={<PrivacyPolicy />} />
            <Route path="etc/signupagree" element={<SignupAgreement />} />
          </Routes>
        </div>
      </div>
    </>
  );
}