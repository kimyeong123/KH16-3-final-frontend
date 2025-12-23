import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";
import OrderShippingModal from "../order/OrderShippingModal";

export default function ProductPurchaseList() {
  const navigate = useNavigate();
  const [accessToken] = useAtom(accessTokenState);

  const [showShip, setShowShip] = useState(false);
  const [selected, setSelected] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);

  // ===== 유틸리티 함수 =====
  const money = (val) => val?.toLocaleString() ?? "0";

  const formatDate = (s) => {
    if (!s) return "-";
    const date = s.replace("T", " ");
    return date.length >= 16 ? date.slice(0, 16).replaceAll("-", ".") : date;
  };

  const isLeadingByRow = (item) => {
    const my = Number(item?.myBidPrice ?? -1);
    const fin = Number(item?.finalPrice ?? -1);
    return my >= fin && fin >= 0;
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
      const res = await axios.get("http://localhost:8080/product/purchase", {
        headers: authHeader,
        params: { page },
      });
      const data = res.data;
      // API 응답 구조에 따른 방어 코드
      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.list)
        ? data.list
        : [];
      setList(rows);
      setPageInfo(Array.isArray(data) ? null : data);
    } catch (err) {
      console.error("목록 로드 실패", err);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, authHeader, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ===== 통합 디자인 시스템 (스타일) =====
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
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 800,
      background: bg,
      color,
      border: "1px solid rgba(0,0,0,0.05)",
    }),
    priceLabel: (isBidding) => ({
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 700,
      marginBottom: 4,
      background: isBidding ? "#e7f5ff" : "#f1f3f5",
      color: isBidding ? "#1c7ed6" : "#495057",
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

  // ✅ 모달 핸들러
  const openShippingModal = (item) => {
    if (!item?.orderNo) return alert("주문 번호(orderNo)를 찾을 수 없습니다.");
    setSelected(item);
    setShowShip(true);
  };

  const totalPage = pageInfo?.totalPage ?? 1;

  return (
    <>
      <div style={st.card}>
        <div style={st.header}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
            내 입찰/낙찰 내역
          </h3>
          <p style={{ margin: "4px 0 0", color: "#868e96", fontSize: 13 }}>
            경매 참여 현황과 배송 정보를 확인하세요.
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={st.table}>
            <thead>
              <tr>
                <th style={{ ...st.th, textAlign: "left" }}>상품 정보</th>
                <th style={{ ...st.th, textAlign: "right" }}>내 입찰가</th>
                <th style={{ ...st.th, textAlign: "right" }}>현재/낙찰가</th>
                <th style={{ ...st.th, textAlign: "center" }}>결과</th>
                <th style={{ ...st.th, textAlign: "center" }}>마감일시</th>
                <th style={{ ...st.th, textAlign: "center" }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {!loading && list.length > 0 ? (
                list.map((item) => {
                  const isBidding = item.status === "BIDDING";
                  const isLeading = isLeadingByRow(item);
                  const shippingDone = Boolean(item.shippingCompleted);

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
                              item.attachmentNo > 0
                                ? `http://localhost:8080/attachment/${item.attachmentNo}`
                                : "/placeholder.png"
                            }
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              objectFit: "cover",
                              background: "#f1f3f5",
                            }}
                            alt="product"
                          />
                          <div style={{ overflow: "hidden" }}>
                            <div
                              onClick={() =>
                                navigate(`/product/detail/${item.productNo}`)
                              }
                              style={{
                                fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.productName}
                            </div>
                            <div style={{ fontSize: 12, color: "#868e96" }}>
                              {item.sellerNickname}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td
                        style={{
                          ...st.td,
                          textAlign: "right",
                          fontWeight: 700,
                          color: "#e03131",
                        }}
                      >
                        {money(item.myBidPrice)}원
                      </td>

                      <td style={{ ...st.td, textAlign: "right" }}>
                        <div style={st.priceLabel(isBidding)}>
                          {isBidding ? "현재가" : "낙찰가"}
                        </div>
                        <div
                          style={{
                            fontWeight: 800,
                            color: isBidding ? "#1c7ed6" : "#212529",
                          }}
                        >
                          {money(item.finalPrice)}원
                        </div>
                      </td>

                      <td style={{ ...st.td, textAlign: "center" }}>
                        {isBidding ? (
                          <span style={st.badge("#e7f5ff", "#1c7ed6")}>
                            입찰중
                          </span>
                        ) : isLeading ? (
                          <span style={st.badge("#fff3bf", "#f08c00")}>
                            낙찰
                          </span>
                        ) : (
                          <span style={st.badge("#ffe3e3", "#c92a2a")}>
                            패찰
                          </span>
                        )}
                      </td>

                      <td
                        style={{
                          ...st.td,
                          textAlign: "center",
                          fontSize: 12,
                          color: "#495057",
                        }}
                      >
                        {formatDate(item.endTime)}
                      </td>

                      <td style={{ ...st.td, textAlign: "center" }}>
                        {isBidding ? (
                          isLeading ? (
                            <button style={st.btnDisabled} disabled>
                              최고가 유지
                            </button>
                          ) : (
                            <button
                              style={st.btn("white", "#e03131", "#e03131")}
                              onClick={() =>
                                navigate(
                                  `/product/auction/detail/${item.productNo}`
                                )
                              }
                            >
                              재입찰
                            </button>
                          )
                        ) : isLeading ? (
                          shippingDone ? (
                            <button style={st.btnDisabled} disabled>
                              입력 완료
                            </button>
                          ) : (
                            <button
                              style={st.btn("#212529", "white")}
                              onClick={() => openShippingModal(item)}
                            >
                              배송지 설정
                            </button>
                          )
                        ) : (
                          <span style={{ fontSize: 12, color: "#adb5bd" }}>
                            종료
                          </span>
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
                    {loading
                      ? "데이터를 불러오는 중입니다..."
                      : "내역이 없습니다."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "16px 24px",
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

      <OrderShippingModal
        show={showShip}
        onHide={() => setShowShip(false)}
        authHeader={authHeader}
        orderNo={selected?.orderNo}
        onSaved={() => {
          setShowShip(false);
          fetchList();
        }}
      />
    </>
  );
}
