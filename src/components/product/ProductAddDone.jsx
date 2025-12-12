// src/components/product/ProductAddDone.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

export default function ProductAddDone() {
  const navigate = useNavigate();
  const location = useLocation();


  const message = location.state?.message ?? "상품이 정상적으로 등록되었습니다.";
  const productNo = location.state?.productNo ?? null;

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-sm border-0" style={{ width: 420, borderRadius: 16 }}>
        <div className="card-body text-center px-4 pt-5 pb-4">
          <div
            className="d-flex justify-content-center align-items-center mx-auto mb-4"
            style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#5b5ce2" }}
          >
            <FaCheck color="white" size={22} />
          </div>

          <h5 className="fw-bold mb-2">상품등록이 완료되었습니다.</h5>
          <div className="text-muted" style={{ fontSize: 14 }}>
            {message}
          </div>
        </div>

        <div className="px-4 pb-4 d-flex gap-2">
          {productNo && (
            <button
              className="btn btn-outline-secondary w-50 fw-semibold"
              style={{ borderRadius: 10, height: 48 }}
              onClick={() => navigate(`/product/detail/${productNo}`)}
            >
              상세보기
            </button>
          )}

          <button
            className="btn w-100 fw-semibold"
            style={{ backgroundColor: "#5b5ce2", color: "white", borderRadius: 10, height: 48 }}
            onClick={() => navigate("/product/list")}
          >
            상품 목록 확인하기
          </button>
        </div>
      </div>
    </div>
  );
}
