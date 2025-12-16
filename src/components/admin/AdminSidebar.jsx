import { NavLink } from "react-router-dom";
import "./Admin.css";

export default function AdminSidebar() {
  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-title">
        ADMIN
      </div>

      <NavLink to="/admin/home" end className="admin-menu">
        대시보드
      </NavLink>

      <NavLink to="/admin/home/member" className="admin-menu">
        회원 관리
      </NavLink>

      <NavLink to="/admin/home/qnalist" className="admin-menu">
        QnA 관리
      </NavLink>
    </div>
  );
}
