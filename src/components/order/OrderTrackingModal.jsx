import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";

export default function OrderTrackingModal({
  show,
  onHide,
  authHeader, // { Authorization: `Bearer ${token}` }
  orderNo, // Long
  defaultValue, // optional: { courier, trackingNumber }
  onSaved, // optional: 저장 성공 후 콜백
}) {
  const [form, setForm] = useState({
    orderNo: null,
    courier: "",
    trackingNumber: "",
  });

  const [saving, setSaving] = useState(false);

  /* ================= 모달 열릴 때 값 동기화 ================= */

  useEffect(() => {
    if (!show) return;

    setForm({
      orderNo: orderNo ?? null,
      courier: defaultValue?.courier ?? "",
      trackingNumber: defaultValue?.trackingNumber ?? "",
    });
  }, [show, orderNo, defaultValue]);

  /* ================= 핸들러 ================= */

  const change = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    if (!form.orderNo) return alert("orderNo가 없습니다.");
    if (!form.courier.trim()) return alert("택배사를 입력해주세요.");
    if (!form.trackingNumber.trim()) return alert("송장번호를 입력해주세요.");

    const body = {
      orderNo: form.orderNo,
      courier: form.courier.trim(),
      trackingNumber: form.trackingNumber.trim(),
    };

    // ✅ 배송지 모달과 동일한 디버깅 포인트
    console.log("📦 송장 전송값", body);

    setSaving(true);
    try {
      await axios.put(
        `http://localhost:8080/orders/${orderNo}/shipping/tracking`,
        body,
        { headers: authHeader }
      );

      // 부모 갱신
      onSaved?.();

      // 닫기
      onHide?.();
    } catch (e) {
      console.error(e);
      alert("송장 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  /* ================= 스타일 ================= */

  const input = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #dee2e6",
    outline: "none",
  };

  const label = { fontWeight: 900, fontSize: 13, marginBottom: 6 };

  /* ================= 렌더 ================= */

  return (
    <Modal
      show={show}
      onHide={() => {
        if (saving) return; // 저장 중 닫기 방지
        onHide?.();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ fontWeight: 900 }}>송장 입력</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={label}>주문번호</div>
            <input
              style={{ ...input, background: "#f8f9fa" }}
              value={form.orderNo ?? ""}
              readOnly
            />
          </div>

          <div>
            <div style={label}>택배사</div>
            <input
              style={input}
              name="courier"
              value={form.courier}
              onChange={change}
              placeholder="예: CJ대한통운 / 로젠 / 한진"
              autoComplete="off"
            />
          </div>

          <div>
            <div style={label}>송장번호</div>
            <input
              style={input}
              name="trackingNumber"
              value={form.trackingNumber}
              onChange={change}
              placeholder="숫자/문자 포함 가능"
              autoComplete="off"
              onKeyDown={(e) => {
                // ✅ 엔터로 저장 (배송지 모달과 UX 통일)
                if (e.key === "Enter") save();
              }}
            />
            <div style={{ fontSize: 12, color: "#6c757d", marginTop: 6 }}>
              * 현재는 연동 전이라 택배사/송장번호를 자유롭게 입력합니다.
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          취소
        </Button>
        <Button variant="dark" onClick={save} disabled={saving}>
          {saving ? "저장중..." : "저장"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
