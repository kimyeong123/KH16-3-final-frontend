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

  const authHeader = useMemo(() => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  const fetchList = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/product/purchase", {
        headers: authHeader,
        params: { page },
      });
      const data = res.data;
      const rows = Array.isArray(data) ? data : (Array.isArray(data?.list) ? data.list : []);
      setList(rows);
      setPageInfo(Array.isArray(data) ? null : data);
    } catch (err) {
      setList([]);
      setPageInfo(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, authHeader, page]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ===== 통합 디자인 시스템 스타일 =====
  const st = {
    card: { border: "1px solid #e9ecef", borderRadius: 12, background: "white", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
    header: { padding: "20px 24px", borderBottom: "1px solid #f1f3f5" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { background: "#f8f9fa", padding: "14px 12px", fontSize: 13, color: "#495057", fontWeight: 700, borderBottom: "1px solid #eef1f4" },
    td: { padding: "16px 12px", borderBottom: "1px solid #f1f3f5", verticalAlign: "middle" },
    badge: (bg, color) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: bg, color, border: "1px solid rgba(0,0,0,0.03)" }),
    btnSolid: (bg) => ({ padding: "8px 14px", borderRadius: 8, border: "none", background: bg, color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }),
    btnOutline: (color) => ({ padding: "8px 14px", borderRadius: 8, border: `1px solid ${color}`, background: "white", color, fontWeight: 700, cursor: "pointer", fontSize: 13 }),
    btnDisabled: { padding: "8px 14px", borderRadius: 8, border: "1px solid #e9ecef", background: "#f8f9fa", color: "#adb5bd", fontWeight: 700, cursor: "not-allowed", fontSize: 13 }
  };

  const money = (val) => (val?.toLocaleString() ?? "-");
  const dt = (s) => s ? s.replace("T", " ").slice(0, 16).replaceAll("-", ".") : "-";
  const isLeadingByRow = (item) => Number(item?.myBidPrice) >= Number(item?.finalPrice);

    // "YYYY-MM-DD HH:mm:ss"
    if (s.length >= 19) {
      return `${s.slice(0, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)} ${s.slice(
        11,
        13
      )}:${s.slice(14, 16)}:${s.slice(17, 19)}`;
    }
    // "YYYY-MM-DD HH:mm"
    if (s.length >= 16) {
      return `${s.slice(0, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)} ${s.slice(
        11,
        13
      )}:${s.slice(14, 16)}`;
    }
    // "YYYY-MM-DD"
    if (s.length >= 10) {
      return `${s.slice(0, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)}`;
    }
    return "-";
  };

  // 낙찰 여부(선두 여부)
  const isLeadingByRow = (item) => {
    const my = Number(item?.myBidPrice ?? -1);
    const fin = Number(item?.finalPrice ?? -1);
    return my >= fin && fin >= 0;
  };

  // ✅ 모달 열기/닫기
  const openShippingModal = (item) => {
    if (!item?.orderNo) {
      alert("orderNo가 없습니다. (purchase list에서 orderNo 내려줘야 함)");
      return;
    }
    setSelected(item);
    setShowShip(true);
  };

  const closeShippingModal = () => {
    setShowShip(false);
    setSelected(null);
  };

  // ===== UI 스타일 (기존 컨셉 유지) =====
  const cardStyle = {
    border: "1px solid #e9ecef",
    borderRadius: 10,
    background: "white",
    overflow: "hidden",
  };

  const badgePill = ({ bg, color, border }) => ({
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: bg,
    color,
    border: border || "1px solid #e9ecef",
    lineHeight: 1.2,
  });

  const btnOutline = (borderColor, color) => ({
    padding: "6px 10px",
    borderRadius: 8,
    border: `1px solid ${borderColor}`,
    background: "white",
    color,
    fontWeight: 800,
    cursor: "pointer",
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

  // 배지 계산
  const auctionStatusBadge = (isBidding) => {
    return isBidding
      ? badgePill({ bg: "#d3f9d8", color: "#2b8a3e" }) // 진행중
      : badgePill({ bg: "#f1f3f5", color: "#495057" }); // 종료
  };

  const resultBadge = (isBidding, isLeading) => {
    if (isBidding) return badgePill({ bg: "#e7f5ff", color: "#1c7ed6" }); // 경매중
    if (isLeading) return badgePill({ bg: "#fff3bf", color: "#f08c00" }); // 낙찰
    return badgePill({ bg: "#ffe3e3", color: "#c92a2a" }); // 패찰
  };

  const priceLabelStyle = (isBidding) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    marginRight: 8,
    background: isBidding ? "#e7f5ff" : "#f1f3f5",
    color: isBidding ? "#1c7ed6" : "#495057",
    border: "1px solid #e9ecef",
  });

  const priceValueStyle = (isBidding) => ({
    fontWeight: 900,
    fontSize: 16,
    color: isBidding ? "#1c7ed6" : "#212529",
  });

  // ✅ PageVO에서 totalPage 계산
  const totalPage =
    pageInfo?.totalPage ??
    (pageInfo?.dataCount && pageInfo?.size
      ? Math.floor((pageInfo.dataCount - 1) / pageInfo.size) + 1
      : null);

  const canPrev = page > 1;
  const canNext = totalPage ? page < totalPage : false;

  return (
    <>
      <div style={st.card}>
        <div style={st.header}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#212529" }}>내 입찰/낙찰 내역</h3>
          <p style={{ margin: "4px 0 0", color: "#868e96", fontSize: 13 }}>경매 참여 현황과 낙찰된 상품의 배송을 관리합니다.</p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={st.table}>
            <thead>
              <tr>
                <th style={{ ...st.th, textAlign: "left", width: "35%" }}>상품 정보</th>
                <th style={{ ...st.th, textAlign: "right" }}>내 입찰가</th>
                <th style={{ ...st.th, textAlign: "right" }}>현재/낙찰가</th>
                <th style={{ ...st.th, textAlign: "center" }}>경매상태</th>
                <th style={{ ...st.th, textAlign: "center" }}>결과</th>
                <th style={{ ...st.th, textAlign: "center" }}>마감일시</th>
                <th style={{ ...st.th, textAlign: "center", width: "120px" }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {!loading && list.map((item) => {
                const isBidding = item.status === "BIDDING";
                const isLeading = isLeadingByRow(item);
                const shippingDone = Boolean(item.shippingCompleted);

                return (
                  <tr key={item.productNo}>
                    <td style={st.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img src={item.attachmentNo > 0 ? `http://localhost:8080/attachment/${item.attachmentNo}` : ""} 
                             style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", background: "#f8f9fa" }} alt="" />
                        <div style={{ overflow: "hidden" }}>
                          <div onClick={() => navigate(`/product/detail/${item.productNo}`)} 
                               style={{ fontWeight: 700, cursor: "pointer", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{item.productName}</div>
                          <div style={{ fontSize: 12, color: "#868e96" }}>판매자: {item.sellerNickname}</div>
                        </div>
                      </td>

                      <td style={{ padding: 12, textAlign: "right" }}>
                        <span style={{ fontWeight: 900, color: "#e03131" }}>
                          {money(item.myBidPrice)}
                        </span>
                        원
                      </td>

                      <td style={{ padding: 12, textAlign: "right" }}>
                        {/* 가격 라벨 */}
                        <div style={{ marginBottom: 4 }}>
                          <span style={priceLabelStyle(isBidding)}>
                            {isBidding ? "현재가" : "낙찰가"}
                          </span>
                        </div>

                        {/* 가격 값 */}
                        <div style={priceValueStyle(isBidding)}>
                          {money(item.finalPrice)}원
                        </div>
                      </td>

                      <td style={{ padding: 12, textAlign: "center" }}>
                        <span style={resultBadge(isBidding, isLeading)}>
                          {isBidding ? "진행중" : isLeading ? "낙찰" : "패찰"}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: 12,
                          textAlign: "center",
                          color: "#6c757d",
                          fontSize: 13,
                        }}
                      >
                        {dt(item.endTime)}
                      </td>

                      <td style={{ padding: 12, textAlign: "center" }}>
                        {isBidding &&
                          (isLeading ? (
                            <button style={btnDisabled} disabled>
                              현재 최고가
                            </button>
                          ) : (
                            <button
                              style={btnOutline("#e03131", "#e03131")}
                              onClick={() =>
                                navigate(
                                  `/product/auction/detail/${item.productNo}`
                                )
                              }
                            >
                              재입찰하기
                            </button>
                          ))}

                        {isEnded &&
                          isLeading &&
                          (shippingDone ? (
                            <button style={btnDisabled} disabled>
                              배송지 입력완료
                            </button>
                          ) : (
                            <button
                              style={btnSolid("#212529")}
                              onClick={() => openShippingModal(item)}
                            >
                              배송지설정
                            </button>
                          ))}

                        {isEnded && !isLeading && (
                          <span
                            style={{
                              fontSize: 13,
                              color: "#adb5bd",
                              fontWeight: 900,
                            }}
                          >
                            배송 대상 아님
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: 20, alignItems: "center", background: "#fcfcfc" }}>
          <div style={{ fontSize: 13, color: "#868e96" }}>페이지 <b>{page}</b> / {totalPage}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={page > 1 ? st.btnOutline("#495057") : st.btnDisabled} onClick={() => setPage(p => p - 1)} disabled={page <= 1}>이전</button>
            <button style={page < totalPage ? st.btnOutline("#495057") : st.btnDisabled} onClick={() => setPage(p => p + 1)} disabled={page >= totalPage}>다음</button>
          </div>
        </div>
      </div>

      <OrderShippingModal 
        show={showShip} onHide={() => setShowShip(false)} authHeader={authHeader} 
        orderNo={selected?.orderNo} onSaved={() => { setShowShip(false); fetchList(); }}
      />
    </>
  );
}