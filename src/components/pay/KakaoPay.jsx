import axios from "axios";
import Jumbotron from "../templates/Jumbotron";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginPointState } from "../../utils/jotai";
import { useAtomValue } from "jotai";
import kakaoPayLogo from "../../assets/kakaopay.png";
import { FaCircleQuestion } from "react-icons/fa6";

export default function KakaoPay() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 빠른 선택 버튼
  const presets = [10000, 30000, 50000, 100000, 200000, 1000000];
  const currentPoint = useAtomValue(loginPointState);

  const numericAmount = useMemo(() => Number(amount), [amount]);
  const isValidAmount = useMemo(() => {
    return amount !== "" && !isNaN(numericAmount) && numericAmount > 0;
  }, [amount, numericAmount]);

  const expectedPoint = useMemo(() => {
    const safeCurrentPoint = Number(currentPoint ?? 0);
    const safeAmount = isValidAmount ? Number(numericAmount) : 0;

    return safeCurrentPoint + safeAmount;
  }, [isValidAmount, currentPoint, numericAmount]);

  //1000원 단위로 강제 변환
  const handleBlur = () => {
    if (amount === "") return;
    const num = Number(amount);
    if (isNaN(num)) return;

    // 1000원 단위로 내림 보정
    const fixed = Math.floor(num / 1000) * 1000;
    setAmount(String(fixed));
  };

  const requestPay = async () => {
    // 1) 금액 검증
    if (!isValidAmount) {
      alert("올바른 금액을 입력하세요");
      return;
    }
    // 2) 로그인(토큰) 확인
    const authHeader = axios.defaults.headers.common["Authorization"];
    if (!authHeader) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/member/login");
      return;
    }
    try {
      setLoading(true);

      const { data } = await axios.post(
        "/kakaopay/buy",
        { amount: numericAmount },
        {
          headers: {
            "Frontend-Url": window.location.origin + "/pay/kakaopay",
            Authorization: authHeader,
          },
        }
      );
      // 3) 카카오페이 결제 페이지 이동
      window.location.href = data.next_redirect_pc_url;
    } catch (e) {
      console.error("카카오페이 결제 요청 에러:", e);

      const status = e?.response?.status;
      const message = e?.response?.data?.message;

      if (status === 401) {
        alert("로그인이 필요한 서비스입니다.");
        navigate("/member/login");
        return;
      }

      if (
        (status === 400 && message === "INVALID_AMOUNT") ||
        (status === 500 && message === "INVALID_AMOUNT_UNIT")
      ) {
        alert("금액이 올바르지 않습니다.");
        return;
      }

      alert("결제 요청 실패");
    } finally {
      setLoading(false);
    }
  };
  const setPreset = (v) => setAmount(String(v));

  return (
    <>

      <div className="container mt-4" style={{ maxWidth: 720 }}>
        {/* 🔹 카드 헤더 */}
        <div className="position-relative mb-4 text-center">
          {/* 가운데 텍스트 */}

          <div>
            <div className="fw-bold fs-3">카카오페이 포인트 충전</div>
            <a
              href="https://www.kakaopay.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={kakaoPayLogo}
                alt="KakaoPay"
                style={{ height: "20px", opacity: 0.9 }}
              />
            </a>
          </div>
        </div>

        <div className="card p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">보유 포인트</h5>
              <small className="text-muted">충전 후 바로 사용할 수 있어요</small>
            </div>
            <h4 className="mb-0">{Number(currentPoint).toLocaleString()} P</h4>
          </div>
        </div>
        <div className="card p-3 mt-3">
          <h5 className="mb-3">충전 금액</h5>

          <div className="d-flex flex-wrap gap-2 mb-3">
            {presets.map((v) => (
              <button
                key={v}
                type="button"
                className={`btn ${String(v) === amount ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setPreset(v)}
                disabled={loading}
              >
                {v.toLocaleString()}원
              </button>
            ))}
          </div>

          <label className="form-label">직접 입력</label>
          <input
            type="number"
            className="form-control"
            placeholder="충전할 금액을 입력하세요."
            value={amount}
            min="1000"
            step="1000"
            onChange={(e) => setAmount(e.target.value)}
            onBlur={handleBlur}
            disabled={loading}
          />
          <small className="text-muted mt-1">
            최소 충전 금액은 1,000원이며, 1,000원 단위로 충전 가능합니다.
          </small>
        </div>

        {/* 3) 결제 요약 + 버튼 */}
        <div className="card p-3 mt-3">
          <h5 className="mb-2">결제 요약</h5>

          <div className="d-flex justify-content-between">
            <span>충전 포인트</span>
            <strong>{isValidAmount ? numericAmount.toLocaleString() : "-"} P</strong>
          </div>

          <div className="d-flex justify-content-between mt-1">
            <span>결제 후 예상 포인트</span>
            <strong>{expectedPoint.toLocaleString()} P</strong>
          </div>
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-success mt-3 w-80"
              onClick={requestPay}
              disabled={!isValidAmount || loading}
            >
              {loading ? "결제 요청 중..." : "카카오페이로 결제하기"}
            </button>
          </div>

          <small className="text-muted mt-2">
            결제 단계 : 금액 선택 → 카카오페이 결제 → 포인트 지급
          </small>
        </div>

        {/* 4) 안내/FAQ */}
         <div className="mt-5 mb-3 text-center">
            <div className="fw-bold fs-5">
              <FaCircleQuestion className="fa-regular fa-circle-question me-1"/>
              자주 묻는 질문
            </div>
          </div>
        <div className="accordion mt-1" id="chargeFaq">
          <div className="accordion-item mt-2">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq5"
              >
                포인트는 어디에서 사용할 수 있나요?
              </button>
            </h2>
            <div id="faq5" className="accordion-collapse collapse" data-bs-parent="#chargeFaq">
              <div className="accordion-body">
                서비스 내 결제/이용권/수수료 등 포인트 결제가 가능한 곳에서 사용할 수 있어요.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq1"
              >
                결제 후 포인트는 언제 지급되나요?
              </button>
            </h2>
            <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#chargeFaq">
              <div className="accordion-body">
                카카오페이 결제 <b>승인 완료</b> 시 포인트가 <b>즉시</b> 지급됩니다.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq3"
              >
                결제 요청이 실패해요.
              </button>
            </h2>
            <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#chargeFaq">
              <div className="accordion-body">
                로그인 상태와 네트워크를 확인해 주세요. 계속 실패하면 관리자나 <a href="/qna/main" className="text-primary fw-bold">고객센터</a>로 문의해 주세요.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
