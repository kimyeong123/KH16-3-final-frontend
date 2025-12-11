import axios from "axios";
import Jumbotron from "../templates/Jumbotron";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function KakaoPay() {
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const requestPay = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("올바른 금액을 입력하세요");
      return;
    }

    try {
      const { data } = await axios.post(
        "/kakaopay/buy",
        {
          
          amount: Number(amount),
        },
        {
         
          headers: {
            "Frontend-Url": window.location.origin + "/pay/kakaopay",
          },
        }
      );

      window.location.href = data.next_redirect_pc_url;
    } catch (e) {
      console.error(e);

      
      if (e.response && e.response.status === 401) {
        alert("로그인이 필요한 서비스입니다.");
        navigate("/member/login");
        return;
      }

      if (e.response && e.response.data && e.response.data.message === "INVALID_AMOUNT") {
        alert("금액이 올바르지 않습니다.");
        return;
      }

      alert("결제 요청 실패");
    }
  };

  return (
    <>
      <Jumbotron subject="포인트 충전" detail="원하는 금액을 입력하세요" />

      <div className="container mt-4">
        <h4>충전 금액(원)</h4>

        <input
          type="number"
          className="form-control w-25"
          placeholder="충전할 금액을 입력하세요"
          value={amount}
          min="1"
          onChange={(e) => setAmount(e.target.value)}
        />

        <button className="btn btn-success mt-4" onClick={requestPay}>
          카카오페이로 결제하기
        </button>
      </div>
    </>
  );
}
