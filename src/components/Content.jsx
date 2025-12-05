import { Route, Routes } from "react-router-dom";
import Home from "./Home";

export default function Content(){



return(
<>
<div className="row">
    <div className="col-md-10 offset-md-1">
<Routes>
     <Route path="/" element={<Home />}></Route>
</Routes>
    </div>
</div>
</>
)
}