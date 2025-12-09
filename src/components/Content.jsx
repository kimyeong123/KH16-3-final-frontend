import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Private from "./guard/Private";

export default function Content(){



return(
<>
<div className="row">
    <div className="col-md-10 offset-md-1">
<Routes>
     <Route path="/" element={<Home />}></Route>










    <Route path="/message/list" element={<Private><messageList/></Private>}></Route>
</Routes>
    </div>
</div>
</>
)
}