
import { Link } from "react-router-dom";

export default function Unauthorization() {
  return (
    <div className="container py-5 text-center">
      <h1 className="mb-3">403</h1>
      <h4 className="mb-3">접근 권한이 없습니다</h4>
      <p className="text-muted">
        관리자 권한이 필요한 페이지입니다.
      </p>

      <Link to="/" className="btn btn-primary mt-3">
        메인으로 이동
      </Link>
    </div>
  );
}
