import Jumbotron from "../templates/Jumbotron"
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaHome } from "react-icons/fa";
import "./Member.css"; 


export default function MemberJoinFinish() {
  const navigate = useNavigate();

  const goToLogin = () => navigate("/member/login");
  const goToHome = () => navigate("/");

  return (
    <div className="member-join-finish">
      <div className="finish-card text-center shadow-lg p-5 rounded mt-5">
        <div className="icon-container mb-4">
          <FaCheckCircle size={100} className="check-icon bounce" />
        </div>

        <h2 className="mb-3 fw-bold text-primary">
          가입 성공!
        </h2>

        <p className="mb-4 text-secondary fs-5">
          이제 로그인 후 다양한 서비스를 이용하실 수 있습니다.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button className="btn btn-primary btn-lg" onClick={goToLogin}>
            로그인 하러 가기
          </button>
          <button className="btn btn-outline-secondary btn-lg" onClick={goToHome}>
            <FaHome className="me-2" />
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}