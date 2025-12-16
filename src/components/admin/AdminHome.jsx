import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Jumbotron from "../templates/Jumbotron";

export default function AdminHome() {
  return (
    <>
      <Jumbotron subject="관리자 페이지" detail="" />

      <div className="container mt-4">
        <div className="row">
          {/* 왼쪽 메뉴 */}
          <div className="col-2">
            <AdminSidebar />
          </div>

          {/* 오른쪽 내용 */}
          <div className="col-10">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
