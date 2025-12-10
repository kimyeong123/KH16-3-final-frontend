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
    import KakaoPay from "./pay/KakaoPay";
    import KakaoPaySuccess from "./pay/KakaoPaySuccess";
    import KakaoPayCancel from "./pay/KakaoPayCancel";
    import KakaoPayFail from "./pay/KakaoPayFail";


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
                        
                            {/* 게시글 페이지 */}
                            <Route path="board/write" element={<BoardWrite/>}></Route>
                            <Route path="board/list" element={<BoardList/>}></Route>
                            <Route path="board/detail" element={<BoardDetail/>}></Route>
                            <Route path="board/edit" element={<BoardEdit/>}></Route>

                            {/* 문의 페이지 */}
                            <Route path="qna/write" element={<QnaWrite/>}></Route>
                            <Route path="qna/list" element={<QnaList/>}></Route>
                            <Route path="qna/detail" element={<QnaDetail/>}></Route>


                            {/* 메세지(알림) */}
                            <Route path="/message/list" element={<MessageList/>}></Route>

    {/* 카카오페이 페이지 (로그인 필요한 영역) */}
                        <Route
                            path="/pay/kakaopay"
                            element={
                                <Private>
                                    <KakaoPay />
                                </Private>
                            }
                        />
                        <Route
                            path="/pay/kakaopay/success"
                            element={
                                <Private>
                                    <KakaoPaySuccess />
                                </Private>
                            }
                        />
                        <Route
                            path="/pay/kakaopay/cancel"
                            element={
                                <Private>
                                    <KakaoPayCancel />
                                </Private>
                            }
                        />
                        <Route
                            path="/pay/kakaopay/fail"
                            element={
                                <Private>
                                    <KakaoPayFail />
                                </Private>
                            }
                        />

                    </Routes>
                    </div>
                </div>
            </>
        )
    }