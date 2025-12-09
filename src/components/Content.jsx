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
                    
                    </Routes>
                </div>
            </div>
        </>
    )
}