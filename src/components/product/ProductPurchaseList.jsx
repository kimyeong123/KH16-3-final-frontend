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

  const totalPage = pageInfo?.totalPage ?? (pageInfo?.dataCount ? Math.ceil(pageInfo.dataCount / (pageInfo.size || 10)) : 1);

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
                      </div>
                    </td>
                    <td style={{ ...st.td, textAlign: "right", fontWeight: 700 }}>{money(item.myBidPrice)}원</td>
                    <td style={{ ...st.td, textAlign: "right" }}>
                      <span style={{ fontSize: 12, color: "#868e96", marginRight: 4 }}>{isBidding ? "현재" : "낙찰"}</span>
                      <span style={{ fontWeight: 700, color: isBidding ? "#1c7ed6" : "#212529" }}>{money(item.finalPrice)}원</span>
                    </td>
                    <td style={{ ...st.td, textAlign: "center" }}>
                      <span style={isBidding ? st.badge("#ebfbee", "#2b8a3e") : st.badge("#f1f3f5", "#495057")}>{isBidding ? "진행중" : "종료"}</span>
                    </td>
                    <td style={{ ...st.td, textAlign: "center" }}>
                      {isBidding ? <span style={st.badge("#e7f5ff", "#1c7ed6")}>입찰중</span> : 
                       isLeading ? <span style={st.badge("#fff3bf", "#f08c00")}>낙찰</span> : <span style={st.badge("#ffe3e3", "#c92a2a")}>패찰</span>}
                    </td>
                    <td style={{ ...st.td, textAlign: "center", fontSize: 13, color: "#495057" }}>{dt(item.endTime)}</td>
                    <td style={{ ...st.td, textAlign: "center" }}>
                      {isBidding ? (
                        isLeading ? <button style={st.btnDisabled} disabled>최고가</button> : 
                        <button style={st.btnOutline("#e03131")} onClick={() => navigate(`/product/auction/detail/${item.productNo}`)}>재입찰</button>
                      ) : (
                        isLeading ? (
                          shippingDone ? <button style={st.btnDisabled} disabled>입력완료</button> :
                          <button style={st.btnSolid("#212529")} onClick={() => { setSelected(item); setShowShip(true); }}>배송지설정</button>
                        ) : <span style={{ fontSize: 12, color: "#adb5bd" }}>-</span>
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