import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap"; // ✅ 추가: 이거 없으면 Modal.hide()에서 터짐

const MIN = 1000;

const holderRegex = /^[가-힣]{2,5}$|^[a-zA-Z]{2,10}$/;
const bankRegex = /^[가-힣a-zA-Z]{2,10}$/;

export default function WithdrawModal({ accessToken, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [touched, setTouched] = useState({
    amount: false,
    bankName: false,
    accountNumber: false,
    accountHolder: false,
  });
  const [loading, setLoading] = useState(false);

  const controlStyle = {
    height: "44px",
    padding: "10px 12px",
  };

  const reset = () => {
    setAmount("");
    setBankName("");
    setAccountNumber("");
    setAccountHolder("");
    setTouched({ amount: false, bankName: false, accountNumber: false, accountHolder: false });
  };

  // ✅ 성공 시 모달 닫기(백드랍까지 정상 제거)
  const closeModal = () => {
    const el = document.getElementById("withdrawModal");
    if (!el) return;

    // 이미 열린 인스턴스가 있으면 가져오고, 없으면 생성
    const modal = Modal.getInstance(el) ?? new Modal(el);
    modal.hide();
  };

  const onlyDigits = (v) => String(v ?? "").replace(/[^\d]/g, "");
  const toNumber = (v) => {
    const digits = onlyDigits(v);
    return digits ? Number(digits) : 0;
  };
  const formatComma = (n) => (n ? n.toLocaleString("ko-KR") : "");

  const handleAmountChange = (e) => {
    const digits = onlyDigits(e.target.value);
    const num = digits ? Number(digits.slice(0, 12)) : 0;
    setAmount(num ? formatComma(num) : "");
  };

  const amt = useMemo(() => toNumber(amount), [amount]);

  const v = useMemo(() => {
    const amountOk = amt >= MIN && amt % 1000 === 0;
    const bankOk = bankRegex.test(bankName.trim());
    const accountOk = onlyDigits(accountNumber).length >= 8;
    const holderOk = holderRegex.test(accountHolder.trim());
    return { amountOk, bankOk, accountOk, holderOk };
  }, [amt, bankName, accountNumber, accountHolder]);

  const amountMsg = !amt
    ? "출금 포인트를 입력해 주세요"
    : amt < MIN
      ? `최소 ${MIN.toLocaleString()}P 이상이어야 합니다`
      : amt % 1000 !== 0
        ? "1,000P 단위로만 신청할 수 있어요"
        : "가능한 포인트입니다";

  const bankMsg = bankName.trim()
    ? v.bankOk
      ? "확인되었습니다"
      : "은행명은 한글/영문 포함  2~10자만 가능합니다"
    : "은행명을 입력해 주세요";

  const accountMsg = accountNumber.trim()
    ? v.accountOk
      ? "확인되었습니다"
      : "계좌번호(숫자)를 조금 더 정확히 입력해 주세요"
    : "계좌번호를 입력해 주세요";

  const holderMsg = accountHolder.trim()
    ? v.holderOk
      ? "확인되었습니다"
      : "예금주는 한글 2~5자 또는 영문 2~10자만 가능합니다"
    : "예금주를 입력해 주세요";

  const allValid = v.amountOk && v.bankOk && v.accountOk && v.holderOk;

  const inputClass = (ok, isTouched) =>
    !isTouched ? "form-control" : ok ? "form-control is-valid" : "form-control is-invalid";

  const feedbackClass = (ok) =>
    ok ? "valid-feedback d-block fw-bold" : "invalid-feedback d-block fw-bold";

  const labelClass = "form-label small text-muted fw-bold";

  const submit = async () => {
    if (!accessToken) return alert("로그인이 필요합니다");
    setTouched({ amount: true, bankName: true, accountNumber: true, accountHolder: true });
    if (!allValid) return;

    try {
      setLoading(true);

      await axios.post(
        "/member/withdraw",
        {
          amount: amt,
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountHolder: accountHolder.trim(),
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // ✅ 1) 모달 먼저 닫기
      closeModal();

      // ✅ 2) 닫힌 뒤 상태 정리(숨김 이벤트에서도 reset 하니까 중복이어도 문제 없음)
      reset();
      onSuccess?.();

      // ✅ 3) alert는 다음 tick에서 (모달 닫힘이 먼저 보이게)
      setTimeout(() => {
        alert("환전 신청이 접수되었습니다");
      }, 0);

    } catch (e) {
      console.error(e);
      alert("환전 신청 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 모달이 완전히 닫힐 때 입력값 초기화
  useEffect(() => {
    const el = document.getElementById("withdrawModal");
    if (!el) return;

    const handler = () => reset();
    el.addEventListener("hidden.bs.modal", handler);
    return () => el.removeEventListener("hidden.bs.modal", handler);
  }, []);

  return (
    <div
      className="modal fade"
      id="withdrawModal"
      tabIndex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold mb-0">출금 신청</h5>
          </div>

          <div className="modal-body">
            <div className="d-flex justify-content-center">
              <div
                className="p-4 rounded w-100"
                style={{
                  maxWidth: 420,
                  background: "#f9fafb",
                  border: "1px solid #eef1f4",
                }}
              >
         
                <div className="mb-4 d-flex flex-column align-items-center">
                  <label className={labelClass}>포인트</label>

                  <div className="input-group w-75">
                    <input
                      className={inputClass(v.amountOk, touched.amount)}
                      style={controlStyle}
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder={`예: ${MIN.toLocaleString()}`}
                      inputMode="numeric"
                      onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      disabled={loading}
                    />
                    <span className="input-group-text fw-bold" style={{ height: controlStyle.height }}>
                      P
                    </span>
                  </div>

                  {touched.amount ? (
                    <div className={feedbackClass(v.amountOk)}>{amountMsg}</div>
                  ) : (
                    <div className="form-text fw-bold">최소 {MIN.toLocaleString()}P 단위</div>
                  )}

                  <div
                    style={{
                      width: "80%",
                      borderBottom: "1px dashed #dee2e6",
                      marginTop: 18,
                    }}
                  />
                </div>

                {/* 은행명 */}
                <div className="mb-4 d-flex flex-column align-items-center">
                  <label className={labelClass}>은행명</label>
                  <input
                    className={inputClass(v.bankOk, touched.bankName)}
                    style={{ ...controlStyle, width: "75%" }}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="예: KB국민은행, 농협은행"
                    onBlur={() => setTouched((t) => ({ ...t, bankName: true }))}
                    disabled={loading}
                  />
                  {touched.bankName && <div className={feedbackClass(v.bankOk)}>{bankMsg}</div>}

                  <div
                    style={{
                      width: "80%",
                      borderBottom: "1px dashed #dee2e6",
                      marginTop: 18,
                    }}
                  />
                </div>

                {/* 계좌번호 */}
                <div className="mb-4 d-flex flex-column align-items-center">
                  <label className={labelClass}>계좌번호</label>
                  <input
                    className={inputClass(v.accountOk, touched.accountNumber)}
                    style={{ ...controlStyle, width: "75%" }}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="예: 000-000-0000"
                    inputMode="numeric"
                    onBlur={() => setTouched((t) => ({ ...t, accountNumber: true }))}
                    disabled={loading}
                  />
                  {touched.accountNumber && (
                    <div className={feedbackClass(v.accountOk)}>{accountMsg}</div>
                  )}

                  <div
                    style={{
                      width: "80%",
                      borderBottom: "1px dashed #dee2e6",
                      marginTop: 18,
                    }}
                  />
                </div>

                {/* 예금주 */}
                <div className="mb-2 d-flex flex-column align-items-center">
                  <label className={labelClass}>예금주</label>
                  <input
                    className={inputClass(v.holderOk, touched.accountHolder)}
                    style={{ ...controlStyle, width: "75%" }}
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="예: 홍길동"
                    onBlur={() => setTouched((t) => ({ ...t, accountHolder: true }))}
                    disabled={loading}
                  />
                  {touched.accountHolder && (
                    <div className={feedbackClass(v.holderOk)}>{holderMsg}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={() => {
                reset();
                document.activeElement?.blur?.();
              }}
              disabled={loading}
            >
              취소
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={submit}
              disabled={loading || !accessToken}
              title={!accessToken ? "로그인이 필요합니다" : !allValid ? "입력값을 확인해 주세요" : ""}
            >
              {loading ? "처리 중..." : "신청하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
