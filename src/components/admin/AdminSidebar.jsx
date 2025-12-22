import { NavLink } from "react-router-dom";
import "./Admin.css";

export default function AdminSidebar() {
  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-title">관리메뉴</div>

      <NavLink to="/admin/home" end className="admin-menu">
        대시보드
      </NavLink>

      <NavLink to="/admin/home/member" className="admin-menu">
        회원
      </NavLink>

      <NavLink to="/admin/home/orders" className="admin-menu">
        주문 관리
      </NavLink>
    
      <NavLink to="/admin/home/withdraw" className="admin-menu">
        출금 요청
      </NavLink>
    </div>
  );
}
