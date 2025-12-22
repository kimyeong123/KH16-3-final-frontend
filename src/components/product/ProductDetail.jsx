import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productNo } = useParams();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  // 토큰 복구(Hydration)
  const TOKEN_KEY = "ACCESS_TOKEN";
  const [hydrated, setHydrated] = useState(false);
  const [mainImage, setMainImage] = useState(null); // 메인 이미지 상태

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if ((!accessToken || String(accessToken).trim().length === 0) && saved) {
      setAccessToken(saved);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  }, [accessToken]);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [previewMap, setPreviewMap] = useState({});

  const authHeader = useMemo(() => {
    if (!accessToken) return "";
    return accessToken.startsWith("Bearer ") ? accessToken : "Bearer " + accessToken;
  }, [accessToken]);

  const ATT_VIEW = (no) => `http://localhost:8080/attachment/${no}`;

  const load = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:8080/product/${productNo}`, {
        headers: accessToken ? { Authorization: authHeader } : undefined,
      });
      if (resp.headers["access-token"]) setAccessToken(resp.headers["access-token"]);

      const data = resp.data;
      setProduct(data || null);

      if (Array.isArray(data?.attachments)) {
        setAttachments(data.attachments);
      } else {
        const attResp = await axios.get(`http://localhost:8080/product/${productNo}/attachments`);
        setAttachments(attResp.data || []);
      }
    } catch (err) {
      alert("상품 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 이미지 미리보기 로드 및 메인 이미지 설정
  useEffect(() => {
    let alive = true;
    const revokeList = [];
    const run = async () => {
      if (!attachments.length) return;
      const next = {};
      for (const a of attachments) {
        const no = a.attachmentNo ?? a.attachment_no;
        try {
          const r = await axios.get(ATT_VIEW(no), {
            responseType: "blob",
            headers: accessToken ? { Authorization: authHeader } : undefined,
          });
          const url = URL.createObjectURL(r.data);
          revokeList.push(url);
          next[no] = url;
          // 첫 번째 이미지를 메인 이미지로 설정
          if (!mainImage && alive) setMainImage(url);
        } catch (e) { console.error(e); }
      }
      if (alive) setPreviewMap(next);
    };
    run();
    return () => {
      alive = false;
      revokeList.forEach(u => URL.revokeObjectURL(u));
    };
  }, [attachments]);

  useEffect(() => {
    if (hydrated && productNo) load();
  }, [hydrated, productNo]);

  const remove = async () => {
    if (!accessToken) return alert("로그인이 필요합니다");
    if (!confirm("이 상품을 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:8080/product/${productNo}`, {
        headers: { Authorization: authHeader },
      });
      alert("삭제되었습니다.");
      navigate("/product/mylist"); 
    } catch (err) { alert("삭제 실패"); }
  };

  if (!hydrated || loading) return <div style={{ textAlign: "center", padding: 100 }}>준비 중...</div>;
  if (!product) return <div style={{ textAlign: "center", padding: 100 }}>상품이 존재하지 않습니다.</div>;

  const p = product;
  const statusColor = p.status === "BIDDING" ? "#e63946" : "#666";

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      {/* 상단 경로/카테고리 */}
      <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>
        홈 &gt; 상품상세 &gt; #{productNo}
      </div>

      <div style={{ display: "flex", gap: 50, marginBottom: 60 }}>
        {/* 좌측: 이미지 갤러리 */}
        <div style={{ width: 450 }}>
          <div style={{ width: "100%", height: 450, borderRadius: 12, overflow: "hidden", border: "1px solid #eee", marginBottom: 15 }}>
            <img 
                src={mainImage || "https://via.placeholder.com/450"} 
                alt="Main" 
                style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }} 
            />
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
            {Object.entries(previewMap).map(([no, url]) => (
              <img
                key={no}
                src={url}
                onClick={() => setMainImage(url)}
                style={{
                  width: 80, height: 80, borderRadius: 8, objectFit: "cover", cursor: "pointer",
                  border: mainImage === url ? "2px solid #333" : "1px solid #ddd"
                }}
              />
            ))}
          </div>
        </div>

        {/* 우측: 상품 정보 섹션 */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 4, background: statusColor, color: "white", fontSize: 12, fontWeight: "bold", marginBottom: 15 }}>
            {p.status}
          </div>
          <h1 style={{ fontSize: 32, margin: "0 0 20px 0", fontWeight: 900 }}>{p.name}</h1>
          
          <div style={{ background: "#f9f9f9", borderRadius: 12, padding: 25, marginBottom: 30 }}>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "15px 0", alignItems: "center" }}>
              <div style={{ color: "#888" }}>시작가</div>
              <div style={{ fontSize: 18 }}>{Number(p.startPrice || 0).toLocaleString()}원</div>
              
              <div style={{ color: "#888" }}>즉시구매가</div>
              <div style={{ fontSize: 22, fontWeight: "bold", color: "#e63946" }}>
                {p.instantPrice ? `${Number(p.instantPrice).toLocaleString()}원` : "없음"}
              </div>

              <div style={{ color: "#888" }}>경매 기간</div>
              <div style={{ fontSize: 14 }}>
                {new Date(p.startTime).toLocaleString()} ~ {new Date(p.endTime).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button 
              onClick={() => navigate(`/product/edit/${productNo}`)}
              style={{ flex: 1, padding: "16px", background: "#333", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
            >
              물품 수정하기
            </button>
            <button 
              onClick={remove}
              style={{ width: 100, padding: "16px", background: "#fff", color: "#e63946", border: "1px solid #e63946", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
            >
              삭제
            </button>
          </div>
          {/* 🔥 수정된 부분: navigate(-1) 대신 직접 경로("/product/mylist") 입력 */}
          <button 
            onClick={() => navigate("/product/mylist")}
            style={{ width: "100%", marginTop: 10, padding: "12px", background: "none", border: "1px solid #ddd", borderRadius: 8, color: "#666", cursor: "pointer" }}
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>

      {/* 하단: 상세 설명 섹션 */}
      <div style={{ borderTop: "2px solid #333", paddingTop: 40 }}>
        <h3 style={{ fontSize: 20, marginBottom: 20 }}>물품 상세 설명</h3>
        <div style={{ 
            lineHeight: "1.8", color: "#444", whiteSpace: "pre-wrap", 
            minHeight: 200, padding: "20px", background: "#fff", border: "1px solid #eee", borderRadius: 12 
        }}>
          {p.description || "등록된 설명이 없습니다."}
        </div>
      </div>
    </div>
  );
}