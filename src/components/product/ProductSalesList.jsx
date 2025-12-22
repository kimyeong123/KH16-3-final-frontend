import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";
import OrderTrackingModal from "../order/OrderTrackingModal";

export default function ProductSalesList() {
  const navigate = useNavigate();
  const [accessToken] = useAtom(accessTokenState);

  /* ================= 상태 ================= */

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);

  const [showTrack, setShowTrack] = useState(false);
  const [selected, setSelected] = useState(null);

  /* ================= 인증 ================= */

  const authHeader = useMemo(() => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  /* ================= 데이터 로딩 ================= */

  const fetchList = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/product/sales", {
        headers: authHeader,
        params: { page },
      });

      const data = res.data;

      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.list)
        ? data.list
        : [];

      console.log("[SALES LIST RAW ROW 0]", rows?.[0]);

      setList(rows);
      setPageInfo(Array.isArray(data) ? null : data);
    } catch (err) {
      console.error("판매 내역 로드 실패:", err);
      setList([]);
      setPageInfo(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, authHeader, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  /* ================= 주문 상태 ================= */

  const ORDER_STATUS_LABEL = {
    CREATED: "주문 생성",
    SHIPPING_READY: "배송지 입력 완료",
    SHIPPED: "배송중",
    DELIVERED: "배송 완료",
    COMPLETED: "거래 완료",
    CANCELLED: "거래 취소",
  };

  const ORDER_STATUS_BADGE = {
    CREATED: { bg: "#e7f5ff", color: "#1c7ed6" },
    SHIPPING_READY: { bg: "#fff3bf", color: "#f08c00" },
    SHIPPED: { bg: "#d0ebff", color: "#1971c2" },
    DELIVERED: { bg: "#d3f9d8", color: "#2b8a3e" },
    COMPLETED: { bg: "#dee2e6", color: "#343a40" },
    CANCELLED: { bg: "#ffe3e3", color: "#c92a2a" },
  };

  /* ================= 유틸 ================= */

  const money = (val) => {
    if (val === null || val === undefined) return "-";
    const n = Number(val);
    if (Number.isNaN(n)) return "-";
    return n.toLocaleString();
  };

  const dt = (dateStr) => {
    if (!dateStr) return "-";
    const s = String(dateStr).trim().replace("T", " ");
    if (s.length >= 19)
      return `${s.slice(0, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)} ${s.slice(
        11,
        13
      )}:${s.slice(14, 16)}:${s.slice(17, 19)}`;
    if (s.length >= 16)
      return `${s.slice(0, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)} ${s.slice(
        11,
        13
      )}:${s.slice(14, 16)}`;
    if (s.length >= 10)
      return `${s.slice(0, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)}`;
    return "-";
  };

  /* ================= 스타일 ================= */

  const cardStyle = {
    border: "1px solid #e9ecef",
    borderRadius: 10,
    background: "white",
    overflow: "hidden",
  };

  const badgePill = ({ bg, color }) => ({
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: bg,
    color,
    border: "1px solid #e9ecef",
    lineHeight: 1.2,
  });

  const btnSolid = (bg, color = "white") => ({
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid transparent",
    background: bg,
    color,
    fontWeight: 900,
    cursor: "pointer",
  });

  const btnDisabled = {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #dee2e6",
    background: "#f1f3f5",
    color: "#adb5bd",
    fontWeight: 900,
    cursor: "not-allowed",
  };

  // ===== 정렬 통일 =====
  const cellCenter = {
    padding: 12,
    textAlign: "center",
    verticalAlign: "middle",
  };

  const cellRight = {
    padding: 12,
    textAlign: "right",
    verticalAlign: "middle",
  };

  const inlineRow = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };

  /* ================= 모달 ================= */

  const openTrackingModal = (row) => {
    if (!row?.orderNo) {
      alert("orderNo가 없습니다.");
      return;
    }
    setSelected(row);
    setShowTrack(true);
  };

  const closeTrackingModal = () => {
    setShowTrack(false);
    setSelected(null);
  };

  /* ================= 페이징 ================= */

  const totalPage =
    pageInfo?.totalPage ??
    (pageInfo?.dataCount && pageInfo?.size
      ? Math.floor((pageInfo.dataCount - 1) / pageInfo.size) + 1
      : null);

  const canPrev = page > 1;
  const canNext = totalPage ? page < totalPage : false;

  /* ================= 렌더 ================= */

  return (
    <>
      <div style={cardStyle}>
        {/* 헤더 */}
        <div style={{ padding: 18, borderBottom: "1px solid #eef1f4" }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>판매 관리</div>
          <div style={{ color: "#6c757d", fontSize: 13 }}>
            주문 상태 기준으로 판매 흐름을 관리합니다.
          </div>
        </div>

        {/* 테이블 */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f8f9fa",
                  borderBottom: "2px solid #eef1f4",
                }}
              >
                <th style={{ padding: 12, textAlign: "left", width: 420 }}>
                  상품
                </th>
                <th style={{ padding: 12, textAlign: "right", width: 160 }}>
                  현재가/낙찰가
                </th>
                <th style={{ padding: 12, textAlign: "center", width: 140 }}>
                  경매상태
                </th>
                <th style={{ padding: 12, textAlign: "center", width: 160 }}>
                  주문단계
                </th>
                <th style={{ padding: 12, textAlign: "center", width: 190 }}>
                  마감일시
                </th>
                <th style={{ padding: 12, textAlign: "center", width: 220 }}>
                  액션
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center" }}>
                    불러오는 중...
                  </td>
                </tr>
              )}

              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 60, textAlign: "center" }}>
                    판매 내역이 없습니다.
                  </td>
                </tr>
              )}

              {!loading &&
                list.map((item) => {
                  const actionState = (() => {
                    if (item.productStatus === "BIDDING")
                      return { label: "경매중", disabled: true };

                    if (item.orderStatus === "CREATED")
                      return { label: "배송지 입력 대기", disabled: true };

                    if (
                      item.orderStatus === "SHIPPING_READY" &&
                      !item.invoiceRegistered
                    )
                      return { label: "송장 입력", disabled: false };

                    if (
                      item.invoiceRegistered ||
                      ["SHIPPED", "DELIVERED", "COMPLETED"].includes(
                        item.orderStatus
                      )
                    )
                      return { label: "입력 완료", disabled: true };

                    return { label: "-", disabled: true };
                  })();

                  return (
                    <tr
                      key={item.productNo}
                      style={{ borderBottom: "1px solid #f1f3f5" }}
                    >
                      {/* 상품 */}
                      <td style={{ padding: 12 }}>
                        <div style={{ display: "flex", gap: 14 }}>
                          <img
                            src={
                              item.attachmentNo
                                ? `http://localhost:8080/attachment/${item.attachmentNo}`
                                : ""
                            }
                            alt="상품이미지"
                            style={{
                              width: 64,
                              height: 64,
                              objectFit: "cover",
                              borderRadius: 10,
                              border: "1px solid #e9ecef",
                            }}
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                          <div>
                            <div
                              style={{ fontWeight: 900, cursor: "pointer" }}
                              onClick={() =>
                                navigate(`/product/detail/${item.productNo}`)
                              }
                            >
                              {item.productName}
                            </div>
                            <div style={{ fontSize: 12, color: "#6c757d" }}>
                              구매자: {item.buyerNickname}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 가격 */}
                      <td style={cellRight}>
                        <div style={inlineRow}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 900,
                              background:
                                item.productStatus === "BIDDING"
                                  ? "#e7f5ff"
                                  : "#f1f3f5",
                              color:
                                item.productStatus === "BIDDING"
                                  ? "#1c7ed6"
                                  : "#495057",
                              border: "1px solid #e9ecef",
                            }}
                          >
                            {item.productStatus === "BIDDING"
                              ? "현재가"
                              : "낙찰가"}
                          </span>

                          <span style={{ fontWeight: 900 }}>
                            {money(item.finalPrice)}원
                          </span>
                        </div>
                      </td>

                      {/* 경매상태 */}
                      <td style={cellCenter}>
                        <span
                          style={badgePill(
                            item.productStatus === "BIDDING"
                              ? { bg: "#d3f9d8", color: "#2b8a3e" }
                              : { bg: "#f1f3f5", color: "#495057" }
                          )}
                        >
                          {item.productStatus === "BIDDING" ? "진행중" : "종료"}
                        </span>
                      </td>

                      {/* 주문단계 */}
                      <td style={cellCenter}>
                        {item.orderStatus ? (
                          <span
                            style={badgePill(
                              ORDER_STATUS_BADGE[item.orderStatus]
                            )}
                          >
                            {ORDER_STATUS_LABEL[item.orderStatus]}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* 마감일시 */}
                      <td style={cellCenter}>{dt(item.endTime)}</td>

                      {/* 액션 */}
                      <td style={cellCenter}>
                        {actionState.disabled ? (
                          <button style={btnDisabled} disabled>
                            {actionState.label}
                          </button>
                        ) : (
                          <button
                            style={btnSolid("#212529")}
                            onClick={() => openTrackingModal(item)}
                          >
                            {actionState.label}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* 페이징 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 14,
            borderTop: "1px solid #eef1f4",
          }}
        >
          <div style={{ fontSize: 13 }}>
            페이지 <b>{page}</b>
            {totalPage && (
              <>
                {" "}
                / <b>{totalPage}</b>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={canPrev ? btnSolid("#495057") : btnDisabled}
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← 이전
            </button>
            <button
              style={canNext ? btnSolid("#495057") : btnDisabled}
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
            >
              다음 →
            </button>
          </div>
        </div>
      </div>

      {/* 송장 입력 모달 */}
      <OrderTrackingModal
        show={showTrack}
        onHide={closeTrackingModal}
        orderNo={selected?.orderNo}
        authHeader={authHeader}
        onSaved={() => {
          closeTrackingModal();
          fetchList();
        }}
      />
    </>
  );
}
