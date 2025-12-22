import { useEffect, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useDaumPostcodePopup } from "react-daum-postcode";
import axios from "axios";

export default function OrderShippingModal({
  show,
  onHide,
  authHeader, // { Authorization: `Bearer ${token}` }
  orderNo, // Long
  defaultValue, // optional: { receiverName, receiverPhone, post, address1, address2 }
  onSaved, // optional: 저장 성공 후 콜백
}) {
  const [form, setForm] = useState({
    orderNo: null,
    receiverName: "",
    receiverPhone: "",
    post: "",
    address1: "",
    address2: "",
  });

  const [saving, setSaving] = useState(false);
  const address2Ref = useRef(null);

  // ✅ 모달 열릴 때 / 주문번호 바뀔 때 폼을 "항상" 최신 값으로 초기화
  useEffect(() => {
    if (!show) return; // 닫혀있을 땐 굳이 리셋 안해도 됨(취향)

    setForm({
      orderNo: orderNo ?? null,
      receiverName: defaultValue?.receiverName ?? "",
      receiverPhone: defaultValue?.receiverPhone ?? "",
      post: defaultValue?.post ?? "",
      address1: defaultValue?.address1 ?? "",
      address2: defaultValue?.address2 ?? "",
    });
  }, [show, orderNo, defaultValue]);

  const openDaum = useDaumPostcodePopup(
    "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
  );

  const searchAddress = () => {
    openDaum({
      onComplete: (data) => {
        const addr =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

        setForm((prev) => ({
          ...prev,
          post: data.zonecode,
          address1: addr,
          address2: "",
        }));

        // ✅ 상세주소 포커스
        setTimeout(() => address2Ref.current?.focus(), 0);
      },
    });
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const normalizePhone = (v) => {
    const only = String(v || "").replace(/\D/g, "");
    if (only.length <= 3) return only;
    if (only.length <= 7) return `${only.slice(0, 3)}-${only.slice(3)}`;
    return `${only.slice(0, 3)}-${only.slice(3, 7)}-${only.slice(7, 11)}`;
  };

  const save = async () => {
    // ✅ 최소 검증(백엔드 검증도 필수로 두고, 프론트는 UX용)
    if (!form.orderNo) return alert("orderNo가 없습니다.");
    if (!form.receiverName.trim()) return alert("수령인 이름을 입력해주세요.");
    if (!form.receiverPhone.trim()) return alert("연락처를 입력해주세요.");
    if (!form.post.trim() || !form.address1.trim() || !form.address2.trim())
      return alert("주소를 모두 입력해주세요.");
    const body = {
      orderNo: form.orderNo,
      receiverName: form.receiverName,
      receiverPhone: form.receiverPhone,
      post: form.post,
      address1: form.address1,
      address2: form.address2,
    };

    // ✅ 바로 여기 (axios 직전)
    console.log("배송지 전송값", body);

    setSaving(true);
    try {
      await axios.put(
        `http://localhost:8080/orders/${orderNo}/shipping/address`,
        body,
        { headers: authHeader }
      );

      // ✅ 저장 성공: 부모쪽 갱신 훅
      onSaved?.();

      // ✅ 닫기
      onHide?.();
    } catch (e) {
      console.error(e);
      alert("배송지 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const input = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #dee2e6",
    outline: "none",
  };

  const label = { fontWeight: 900, fontSize: 13, marginBottom: 6 };

  return (
    <Modal
      show={show}
      onHide={() => {
        if (saving) return; // ✅ 저장 중이면 닫기 막고 싶으면
        onHide?.();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ fontWeight: 900 }}>배송지 설정</Modal.Title>
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
            <div style={label}>수령인</div>
            <input
              style={input}
              name="receiverName"
              value={form.receiverName}
              onChange={change}
              placeholder="수령인 이름"
            />
          </div>

          <div>
            <div style={label}>연락처</div>
            <input
              style={input}
              name="receiverPhone"
              value={form.receiverPhone}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  receiverPhone: normalizePhone(e.target.value),
                }))
              }
              placeholder="010-0000-0000"
            />
          </div>

          <div>
            <div style={label}>우편번호</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...input, flex: 1 }}
                name="post"
                value={form.post}
                readOnly
                placeholder="우편번호"
              />
              <button
                type="button"
                onClick={searchAddress}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #212529",
                  background: "#212529",
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                주소검색
              </button>
            </div>
          </div>

          <div>
            <div style={label}>기본주소</div>
            <input
              style={{ ...input, cursor: "pointer" }}
              name="address1"
              value={form.address1}
              readOnly
              onClick={searchAddress}
              placeholder="기본주소"
            />
          </div>

          <div>
            <div style={label}>상세주소</div>
            <input
              ref={address2Ref}
              style={input}
              name="address2"
              value={form.address2}
              onChange={change}
              placeholder="상세주소"
              onKeyDown={(e) => {
                // ✅ 엔터로 저장 UX
                if (e.key === "Enter") save();
              }}
            />
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
