import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";
import OrderTrackingModal from "../order/OrderTrackingModal";

export default function ProductSalesList() {
  const navigate = useNavigate();
  const [accessToken] = useAtom(accessTokenState);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [showTrack, setShowTrack] = useState(false);
  const [selected, setSelected] = useState(null);

  // ===== 유틸리티 & 설정 =====
  const money = (val) => val?.toLocaleString() ?? "0";
  const formatDate = (s) =>
    s ? s.replace("T", " ").slice(0, 16).replaceAll("-", ".") : "-";

  const STATUS_MAP = {
    CREATED: { label: "주문생성", bg: "#e7f5ff", color: "#1c7ed6" },
    SHIPPING_READY: { label: "배송준비", bg: "#fff3bf", color: "#f08c00" },
    SHIPPED: { label: "배송중", bg: "#d0ebff", color: "#1971c2" },
    DELIVERED: { label: "배송완료", bg: "#d3f9d8", color: "#2b8a3e" },
    COMPLETED: { label: "거래종료", bg: "#f1f3f5", color: "#868e96" },
  };

  const st = {
    card: {
      border: "1px solid #e9ecef",
      borderRadius: 12,
      background: "white",
      overflow: "hidden",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    },
    header: { padding: "20px 24px", borderBottom: "1px solid #f1f3f5" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      background: "#f8f9fa",
      padding: "14px 12px",
      fontSize: 13,
      color: "#495057",
      fontWeight: 700,
      borderBottom: "1px solid #eef1f4",
    },
    td: {
      padding: "16px 12px",
      borderBottom: "1px solid #f1f3f5",
      verticalAlign: "middle",
    },
    badge: (bg, color) => ({
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 700,
      background: bg,
      color,
    }),
    btn: (bg, color = "white", border = "transparent") => ({
      padding: "8px 14px",
      borderRadius: 8,
      border: `1px solid ${border}`,
      background: bg,
      color,
      fontWeight: 700,
      cursor: "pointer",
      fontSize: 13,
    }),
    btnDisabled: {
      padding: "8px 14px",
      borderRadius: 8,
      border: "1px solid #e9ecef",
      background: "#f8f9fa",
      color: "#adb5bd",
      fontWeight: 700,
      cursor: "not-allowed",
      fontSize: 13,
    },
  };

  // ===== API 통신 =====
  const authHeader = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

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
      setList(rows);
      setPageInfo(Array.isArray(data) ? null : data);
    } catch (err) {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, authHeader, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const totalPage = pageInfo?.totalPage ?? 1;

  return (
    <>
      <div style={st.card}>
        <div style={st.header}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
            판매 관리 내역
          </h3>
          <p style={{ margin: "4px 0 0", color: "#868e96", fontSize: 13 }}>
            등록한 상품의 경매 현황 및 주문 배송을 관리합니다.
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={st.table}>
            <thead>
              <tr>
                <th style={{ ...st.th, textAlign: "left" }}>상품 정보</th>
                <th style={{ ...st.th, textAlign: "right" }}>현재/낙찰가</th>
                <th style={{ ...st.th, textAlign: "center" }}>경매상태</th>
                <th style={{ ...st.th, textAlign: "center" }}>주문단계</th>
                <th style={{ ...st.th, textAlign: "center" }}>마감일시</th>
                <th style={{ ...st.th, textAlign: "center" }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {!loading && list.length > 0 ? (
                list.map((item) => {
                  const isBidding = item.productStatus === "BIDDING";
                  const orderState = STATUS_MAP[item.orderStatus];

                  // 송장 입력 버튼 활성화 조건: 배송준비 단계이면서 아직 송장이 등록되지 않았을 때
                  const canInputInvoice =
                    item.orderStatus === "SHIPPING_READY" &&
                    !item.invoiceRegistered;

                  return (
                    <tr key={item.productNo}>
                      <td style={st.td}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <img
                            src={
                              item.attachmentNo
                                ? `http://localhost:8080/attachment/${item.attachmentNo}`
                                : "/placeholder.png"
                            }
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 8,
                              objectFit: "cover",
                              background: "#f8f9fa",
                            }}
                            alt=""
                          />
                          <div>
                            <div
                              onClick={() =>
                                navigate(`/product/detail/${item.productNo}`)
                              }
                              style={{ fontWeight: 700, cursor: "pointer" }}
                            >
                              {item.productName}
                            </div>
                            <div style={{ fontSize: 12, color: "#868e96" }}>
                              구매자: {item.buyerNickname || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ ...st.td, textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: isBidding ? "#1c7ed6" : "#495057",
                            fontWeight: 700,
                          }}
                        >
                          {isBidding ? "현재가" : "낙찰가"}
                        </div>
                        <div style={{ fontWeight: 800 }}>
                          {money(item.finalPrice)}원
                        </div>
                      </td>

                      <td style={{ ...st.td, textAlign: "center" }}>
                        <span
                          style={
                            isBidding
                              ? st.badge("#ebfbee", "#2b8a3e")
                              : st.badge("#f1f3f5", "#495057")
                          }
                        >
                          {isBidding ? "진행중" : "종료"}
                        </span>
                      </td>

                      <td style={{ ...st.td, textAlign: "center" }}>
                        {orderState ? (
                          <span
                            style={st.badge(orderState.bg, orderState.color)}
                          >
                            {orderState.label}
                          </span>
                        ) : (
                          <span style={{ color: "#adb5bd", fontSize: 12 }}>
                            -
                          </span>
                        )}
                      </td>

                      <td
                        style={{
                          ...st.td,
                          textAlign: "center",
                          fontSize: 13,
                          color: "#495057",
                        }}
                      >
                        {formatDate(item.endTime)}
                      </td>

                      <td style={{ ...st.td, textAlign: "center" }}>
                        {canInputInvoice ? (
                          <button
                            style={st.btn("#212529")}
                            onClick={() => {
                              setSelected(item);
                              setShowTrack(true);
                            }}
                          >
                            송장 입력
                          </button>
                        ) : (
                          <button style={st.btnDisabled} disabled>
                            {isBidding
                              ? "경매중"
                              : item.invoiceRegistered
                              ? "입력 완료"
                              : "-"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      ...st.td,
                      textAlign: "center",
                      padding: 40,
                      color: "#adb5bd",
                    }}
                  >
                    {loading ? "불러오는 중..." : "판매 내역이 없습니다."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 20,
            alignItems: "center",
            background: "#fcfcfc",
          }}
        >
          <div style={{ fontSize: 13, color: "#868e96" }}>
            페이지 <b>{page}</b> / {totalPage}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={
                page > 1
                  ? st.btn("white", "#495057", "#ced4da")
                  : st.btnDisabled
              }
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              이전
            </button>
            <button
              style={
                page < totalPage
                  ? st.btn("white", "#495057", "#ced4da")
                  : st.btnDisabled
              }
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPage}
            >
              다음
            </button>
          </div>
        </div>
      </div>

      <OrderTrackingModal
        show={showTrack}
        onHide={() => setShowTrack(false)}
        orderNo={selected?.orderNo}
        authHeader={authHeader}
        onSaved={() => {
          setShowTrack(false);
          fetchList();
        }}
      />
    </>
  );
}
