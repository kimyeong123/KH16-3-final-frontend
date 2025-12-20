import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";
import ProductPurchaseList from "./ProductPurchaseList"; 

export default function ProductMyList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("SALES");
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  // === 판매 내역 관련 State ===
  const [page, setPage] = useState(1);
  const [vo, setVo] = useState({ list: [], last: true });
  const [loading, setLoading] = useState(false);
  const [thumbNoByProduct, setThumbNoByProduct] = useState({}); 

  // 인증 헤더
  const authHeader = useMemo(() => {
    if (!accessToken) return "";
    return accessToken.startsWith("Bearer ") ? accessToken : "Bearer " + accessToken;
  }, [accessToken]);

  // === 유틸리티 함수 ===
  const ATT_VIEW = (attachmentNo) => `http://localhost:8080/attachment/${attachmentNo}`;
  const money = (v) => (v ? Number(v).toLocaleString() : "0");
  const dt = (v) => (v ? new Date(v).toLocaleString().split('. ').slice(0, 3).join('.') : "-");
  
  const get = (obj, keys) => {
    if (!obj) return undefined;
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  };

  // === 데이터 불러오기 ===
  const fetchList = async (targetPage) => {
    if (!accessToken || activeTab !== "SALES") return;

    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:8080/product/my/page/${targetPage}`, {
        headers: { Authorization: authHeader },
      });

      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed) setAccessToken(renewed);

      const data = resp.data;
      const list = data?.list || [];
      const last = data?.last ?? true;

      setVo({ list, last });
    } catch (err) {
      if (err.response?.status === 401) {
        setAccessToken("");
        navigate("/member/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "SALES") {
        fetchList(page);
    }
  }, [page, accessToken, activeTab]); 

  // 썸네일 로직
  const resolveThumbNo = (p) => {
    const atts = get(p, ["attachments", "attachmentList"]);
    if (Array.isArray(atts) && atts.length > 0) {
        return atts[0].attachmentNo || atts[0].attachment_no;
    }
    return get(p, ["thumbnailAttachmentNo", "thumbnail_attachment_no"]);
  };

  useEffect(() => {
    if (activeTab !== "SALES" || !vo.list.length) return;
    let alive = true;

    const run = async () => {
        const targets = [];
        for (const p of vo.list) {
            const pNo = get(p, ["productNo", "product_no"]);
            if (!pNo || resolveThumbNo(p) || thumbNoByProduct[pNo]) continue;
            targets.push(pNo);
        }
        if (targets.length === 0) return;

        const chunkSize = 6;
        for (let i = 0; i < targets.length; i += chunkSize) {
            const chunk = targets.slice(i, i + chunkSize);
            const res = await Promise.all(chunk.map(async (no) => {
                try {
                    const r = await axios.get(`http://localhost:8080/product/${no}/attachments`);
                    const att = r.data?.[0];
                    return { no, attNo: att?.attachmentNo || att?.attachment_no };
                } catch { return { no, attNo: null }; }
            }));
            
            if (!alive) return;
            const patch = {};
            res.forEach(x => { if(x.attNo) patch[x.no] = x.attNo; });
            setThumbNoByProduct(prev => ({...prev, ...patch}));
        }
    };
    run();
    return () => { alive = false; };
  }, [vo.list, activeTab]);

  const goDetail = (pNo, status) => {
    if (status === 'BIDDING') navigate(`/product/auction/detail/${pNo}`);
    else navigate(`/product/detail/${pNo}`);
  };

  // === 스타일 ===
  const tabStyle = (isActive) => ({
      padding: "16px 24px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      color: isActive ? "#333" : "#aaa",
      background: "transparent",
      border: "none",
      borderBottom: isActive ? "3px solid #333" : "1px solid #ddd",
      flex: 1,
      transition: "0.2s"
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
      
      {/* 탭 버튼 영역 */}
      <div style={{ display: "flex", marginBottom: "30px" }}>
          <button style={tabStyle(activeTab === "SALES")} onClick={() => setActiveTab("SALES")}>내 판매 내역</button>
          <button style={tabStyle(activeTab === "PURCHASE")} onClick={() => setActiveTab("PURCHASE")}>내 구매/입찰 내역</button>
      </div>

      {activeTab === "PURCHASE" && <ProductPurchaseList />}

      {activeTab === "SALES" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontWeight: "800", fontSize: "22px" }}>내가 등록한 물품</h3>
                <button 
                    onClick={() => navigate("/product/productadd")} 
                    style={{ padding: "10px 20px", background: "#333", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}
                >
                    + 새 물품 등록
                </button>
            </div>

            <div style={{ borderTop: "2px solid #333", background: "white", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #eee" }}>
                        <th style={{ padding: "15px", textAlign: "left", width: "100px", color: "#666" }}>이미지</th>
                        <th style={{ padding: "15px", textAlign: "left", color: "#666" }}>상품명</th>
                        <th style={{ padding: "15px", textAlign: "right", color: "#666" }}>금액 정보</th>
                        <th style={{ padding: "15px", textAlign: "center", color: "#666" }}>경매 기간</th>
                        <th style={{ padding: "15px", textAlign: "center", width: "100px", color: "#666" }}>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {vo.list.length === 0 && !loading && (
                    <tr>
                        <td colSpan={5} style={{ padding: 80, textAlign: "center", color: "#999" }}>등록된 물품이 없습니다.</td>
                    </tr>
                    )}
                    {vo.list.map((p) => {
                        const pNo = get(p, ["productNo", "product_no"]);
                        const attNo = resolveThumbNo(p) || thumbNoByProduct[pNo];
                        const status = get(p, ["status"]);

                        return (
                            <tr key={pNo} 
                                onClick={() => goDetail(pNo, status)}
                                style={{ borderBottom: "1px solid #f0f0f0", cursor: "pointer" }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fafafa"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                <td style={{ padding: "15px" }}>
                                    {attNo ? (
                                    <img src={ATT_VIEW(attNo)} alt="thumb" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                                    ) : (
                                    <div style={{ width: 80, height: 80, background: "#f5f5f5", borderRadius: 8 }} />
                                    )}
                                </td>
                                <td style={{ padding: "15px" }}>
                                    <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "4px" }}>No. {pNo}</div>
                                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>{get(p, ["name", "productName"])}</div>
                                </td>
                                <td style={{ padding: "15px", textAlign: "right" }}>
                                    <div style={{ fontSize: "13px", color: "#999" }}>시작가 {money(get(p, ["startPrice", "start_price"]))}원</div>
                                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#d32f2f", marginTop: "4px" }}>
                                        {money(get(p, ["finalPrice", "final_price"]))}원
                                    </div>
                                </td>
                                <td style={{ padding: "15px", textAlign: "center", fontSize: "13px", color: "#666" }}>
                                    <div>{dt(get(p, ["startTime", "start_time"]))}</div>
                                    <div style={{ color: "#eee", margin: "2px 0" }}>~</div>
                                    <div>{dt(get(p, ["endTime", "end_time"]))}</div>
                                </td>
                                <td style={{ padding: "15px", textAlign: "center" }}>
                                    <span style={{ 
                                        fontSize: "11px", 
                                        padding: "4px 10px", 
                                        borderRadius: "20px",
                                        background: status === 'BIDDING' ? "#e3f2fd" : "#f5f5f5",
                                        color: status === 'BIDDING' ? "#1976d2" : "#888",
                                        fontWeight: "bold"
                                    }}>
                                        {status}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 40 }}>
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page <= 1} 
                  style={{ padding: "8px 16px", border: "1px solid #ddd", background: "white", cursor: "pointer", borderRadius: 4 }}
                >이전</button>
                <span style={{ padding: "8px 16px", fontWeight: "bold" }}>{page}</span>
                <button 
                  onClick={() => setPage(p => (vo.last ? p : p + 1))} 
                  disabled={vo.last} 
                  style={{ padding: "8px 16px", border: "1px solid #ddd", background: "white", cursor: "pointer", borderRadius: 4 }}
                >다음</button>
            </div>
          </>
      )}
    </div>
  );
}