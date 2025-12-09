import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import MemberJoin from "./member/MemberJoin";

export default function Content(){



return(
<>
<div className="row">
    <div className="col-md-10 offset-md-1">
<Routes>
    {/* 메인페이지 */}
     <Route path="/" element={<Home />}></Route>

     {/* 회원 관련 페이지들 */}
     <Route path="/member/join" element={<MemberJoin />}></Route>
     {/* <Route path="/member/login" element={<MemberLogin />}></Route> */}
</Routes>
    </div>
</div>
</>
)
}