import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";

// ▼▼▼ [추가] 구매 내역 컴포넌트 임포트 (같은 폴더에 있다고 가정)
import ProductPurchaseList from "./ProductPurchaseList"; 

export default function ProductMyList() {
  const navigate = useNavigate();
  
  // === [추가] 탭 상태 관리 ('SALES': 판매내역, 'PURCHASE': 구매내역) ===
  const [activeTab, setActiveTab] = useState("SALES");

  // Jotai
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
  const money = (v) => (v ? Number(v).toLocaleString() : "-");
  const dt = (v) => (v ? new Date(v).toLocaleString() : "-");
  
  const get = (obj, keys) => {
    if (!obj) return undefined;
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  };

  // === 데이터 불러오기 (판매 내역용) ===
  const fetchList = async (targetPage) => {
    if (!accessToken || activeTab !== "SALES") return; // 탭이 다르면 요청 안 함

    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:8080/product/my/page/${targetPage}`, {
        headers: { Authorization: authHeader },
      });

      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed) setAccessToken(renewed);

      const data = resp.data;
      const list = data?.list || data?.content || data || [];
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

  // useEffect: 탭이 'SALES'일 때만 데이터 로드
  useEffect(() => {
    if (activeTab === "SALES") {
        fetchList(page);
    }
    // eslint-disable-next-line
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

  // 버튼 기능
  const goDetail = (pNo, status) => {
    if (status === 'BIDDING') navigate(`/product/auction/detail/${pNo}`);
    else navigate(`/product/detail/${pNo}`);
  };

  const remove = async (pNo) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:8080/product/${pNo}`, {
        headers: { Authorization: authHeader },
      });
      alert("삭제되었습니다.");
      fetchList(page);
    } catch (err) {
      alert("삭제 실패");
    }
  };

  // === 스타일 ===
  const tabStyle = (isActive) => ({
      padding: "12px 24px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      borderBottom: isActive ? "3px solid #333" : "3px solid transparent",
      color: isActive ? "#333" : "#999",
      background: "transparent",
      border: "none",
      borderBottom: isActive ? "3px solid #333" : "1px solid #ddd",
      flex: 1,
      transition: "0.2s"
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      
      {/* === [탭 버튼 영역] === */}
      <div style={{ display: "flex", marginBottom: "30px", borderBottom: "1px solid #ddd" }}>
          <button 
            style={tabStyle(activeTab === "SALES")}
            onClick={() => setActiveTab("SALES")}
          >
            내 판매 내역 (물품등록)
          </button>
          <button 
            style={tabStyle(activeTab === "PURCHASE")}
            onClick={() => setActiveTab("PURCHASE")}
          >
            내 구매/입찰 내역
          </button>
      </div>

      {/* === [조건부 렌더링 1] 구매 내역 탭 선택 시 === */}
      {activeTab === "PURCHASE" && (
          <ProductPurchaseList />
      )}

      {/* === [조건부 렌더링 2] 판매 내역 탭 선택 시 (기존 코드) === */}
      {activeTab === "SALES" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 15 }}>
                <h3 style={{ margin: 0, fontWeight: "bold" }}>내가 등록한 물품</h3>
                <button 
                    onClick={() => navigate("/product/productadd")} 
                    style={{ padding: "8px 16px", background: "#333", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}
                >
                    + 새 물품 등록
                </button>
            </div>

            <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", background: "white" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eee" }}>
                    <th style={{ padding: 12, textAlign: "left" }}>이미지</th>
                    <th style={{ padding: 12, textAlign: "left" }}>번호</th>
                    <th style={{ padding: 12, textAlign: "left" }}>상품명</th>
                    <th style={{ padding: 12, textAlign: "right" }}>시작가</th>
                    <th style={{ padding: 12, textAlign: "right" }}>현재가</th>
                    <th style={{ padding: 12, textAlign: "center" }}>상태</th>
                    <th style={{ padding: 12, textAlign: "center" }}>시작일</th>
                    <th style={{ padding: 12, textAlign: "center" }}>마감일</th>
                    <th style={{ padding: 12, textAlign: "center" }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {vo.list.length === 0 && !loading && (
                    <tr>
                        <td colSpan={9} style={{ padding: 50, textAlign: "center", color: "#999" }}>등록된 물품이 없습니다.</td>
                    </tr>
                    )}
                    {vo.list.map((p) => {
                    const pNo = get(p, ["productNo", "product_no"]);
                    const attNo = resolveThumbNo(p) || thumbNoByProduct[pNo];
                    const status = get(p, ["status"]);
                    const isLocked = status === 'BIDDING' || status === 'ENDED' || status === 'CLOSED';

                    return (
                        <tr key={pNo} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: 12 }}>
                            {attNo ? (
                            <img src={ATT_VIEW(attNo)} alt="thumb" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 4, border: "1px solid #eee" }} />
                            ) : (
                            <div style={{ width: 80, height: 60, background: "#f0f0f0", borderRadius: 4 }} />
                            )}
                        </td>
                        <td style={{ padding: 12 }}>{pNo}</td>
                        <td style={{ padding: 12 }}>
                            <span 
                            onClick={() => goDetail(pNo, status)} 
                            style={{ cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
                            >
                            {get(p, ["name", "productName"])}
                            </span>
                        </td>
                        <td style={{ padding: 12, textAlign: "right" }}>{money(get(p, ["startPrice", "start_price"]))}</td>
                        <td style={{ padding: 12, textAlign: "right", color: "#d32f2f", fontWeight: "bold" }}>
                            {money(get(p, ["finalPrice", "final_price"])) || "-"}
                        </td>
                        <td style={{ padding: 12, textAlign: "center" }}>
                            <span style={{ fontSize: 12, padding: "4px 8px", background: "#f0f0f0", borderRadius: 4, color: "#666" }}>
                                {status}
                            </span>
                        </td>
                        <td style={{ padding: 12, textAlign: "center", fontSize: 13, color: "#555" }}>
                            {dt(get(p, ["startTime", "start_time"]))}
                        </td>
                        <td style={{ padding: 12, textAlign: "center", fontSize: 13, color: "#555" }}>
                            {dt(get(p, ["endTime", "end_time"]))}
                        </td>
                        <td style={{ padding: 12, textAlign: "center" }}>
                            <button 
                            onClick={() => !isLocked && navigate(`/product/edit/${pNo}`)} 
                            disabled={isLocked}
                            style={{ marginRight: 5, padding: "5px 10px", cursor: isLocked ? "not-allowed" : "pointer", opacity: isLocked ? 0.3 : 1 }}
                            >
                            수정
                            </button>
                            <button 
                            onClick={() => !isLocked && remove(pNo)} 
                            disabled={isLocked}
                            style={{ color: "red", padding: "5px 10px", cursor: isLocked ? "not-allowed" : "pointer", opacity: isLocked ? 0.3 : 1 }}
                            >
                            삭제
                            </button>
                        </td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </div>

            {/* 페이지네이션 (판매내역용) */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: "6px 12px" }}>이전</button>
                <span style={{ padding: "6px 12px", fontWeight: "bold" }}>page {page}</span>
                <button onClick={() => setPage(p => (vo.last ? p : p + 1))} disabled={vo.last} style={{ padding: "6px 12px" }}>다음</button>
            </div>
          </>
      )}
    </div>
  );
}