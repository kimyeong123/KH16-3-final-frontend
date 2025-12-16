import { useState } from "react";
import axios from "axios";

export default function PointExchange() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("환전 금액은 1 이상 숫자로 입력하세요.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken"); // 너 프로젝트 저장 방식에 맞춰
    if (!accessToken) {
      setError("로그인이 필요합니다. (accessToken 없음)");
      return;
    }

    try {
      setLoading(true);

      // ✅ 서버 주소: 프록시 쓰면 "" 로 두고, 아니면 http://localhost:8080
      const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

      const resp = await axios.post(
        `${baseURL}/kakaopay/exchange`,
        { amount: n },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMsg(`환전(차감) 완료: ${resp.data?.result ?? "OK"}`);
      setAmount("");
    } catch (err) {
      const status = err?.response?.status;
      const code = err?.response?.data?.message || err?.response?.data || err?.message;

      if (status === 401) setError("인증 만료/실패입니다. 다시 로그인하세요.");
      else if (status === 409) setError("포인트 잔액이 부족합니다.");
      else if (status === 400) setError("요청 값이 잘못됐습니다. (금액 확인)");
      else setError(`요청 실패: ${status ?? ""} ${String(code)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>포인트 환전(차감)</h2>

      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: 8 }}>
          환전 금액
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="예: 5000"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            disabled={loading}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "처리 중..." : "환전(차감)하기"}
        </button>
      </form>

      {msg && (
        <div style={{ marginTop: 12, padding: 10, border: "1px solid #ccc" }}>
          ✅ {msg}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, padding: 10, border: "1px solid #f99" }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}
