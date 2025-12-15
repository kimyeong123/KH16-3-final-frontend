import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Private from "./guard/Private";
import MemberJoin from "./member/MemberJoin";
import MemberLogin from "./member/MemberLogin";
import MessageList from "./message/MessageList";
import BoardWrite from "./board/BoardWrite";
import BoardList from "./board/BoardList";
import BoardDetail from "./board/BoardDetail";
import BoardEdit from "./board/BoardEdit";
import QnaWrite from "./qna/QnaWrite";
import QnaDetail from "./qna/QnaDetail";
import QnaList from "./qna/QnaList";
import MemberJoinFinish from "./member/MemberJoinFinish";
import MemberMypage from "./member/MemberMypage";
import KakaoPay from "./pay/KakaoPay";
import KakaoPaySuccess from "./pay/KakaoPaySuccess";
import KakaoPayCancel from "./pay/KakaoPayCancel";
import KakaoPayFail from "./pay/KakaoPayFail";
import ProductAdd from "./product/ProductAdd";
import ProductAddDone from "./product/ProductAddDone";
import ProductDetail from "./product/ProductDetail";
import ProductEdit from "./product/ProductEdit";
import ProductList from "./product/ProductList";
import Exchange from "./pay/Exchange";
export default function Content() {

    return (<>
            <div className="row">
                <div className="col-md-10 offset-md-1">
                    <Routes>
                        {/* 메인페이지 */}
                        <Route path="/" element={<Home />}></Route>

                        {/* 회원 관련 페이지들 */}
                        <Route path="/member/join" element={<MemberJoin />}></Route>
                        <Route path="/member/login" element={<MemberLogin />}></Route>
                        <Route path="/member/joinfinish" element={<MemberJoinFinish />}></Route>
                        <Route path="/member/mypage" element={<MemberMypage />}></Route>
                    
                        {/* 게시글 페이지 */}
                        {/*<Route path="board/write" element={<Admin><BoardWrite/></Admin>}></Route>*/}
                        <Route path="board/list" element={<BoardList/>}></Route>
                        <Route path="board/detail/:boardNo" element={<BoardDetail/>}></Route>
                        <Route path="board/edit" element={<BoardEdit/>}></Route>

                        {/* 문의 페이지 */}
                        <Route path="qna/write" element={<QnaWrite/>}></Route>
                        <Route path="qna/list" element={<QnaList/>}></Route>
                        <Route path="qna/detail" element={<QnaDetail/>}></Route>


                        {/* 메세지(알림) */}
                        <Route path="/message/list" element={<MessageList/>}></Route>

                        {/* 카카오페이 */}                    
                         <Route path="/pay/kakaopay" element={<KakaoPay />} />
                        <Route path="/pay/kakaopaySuccess" element={<KakaoPaySuccess />} />
                        <Route path="/pay/kakaopayCancel" element={<KakaoPayCancel />} />
                        <Route path="/pay/kakaopayFail" element={<KakaoPayFail />} />
                        <Route path="/pay/exchange" element={<Exchange  />} />
                    
                      {/*  상품 등록 페이지 */}
                        <Route path="/product/productadd" element={<ProductAdd />} />
                        <Route path="/product/done" element={<ProductAddDone />} />
                        <Route path="/product/list" element={<ProductList />} />
                         <Route path="/product/detail/:productNo" element={<ProductDetail />} />
                        <Route path="/product/edit/:productNo" element={<ProductEdit />} />
                    </Routes>
                    </div>
                </div>
            </>
        )
    }