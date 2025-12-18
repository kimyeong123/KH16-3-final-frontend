import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";

export default function ProductMyList() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  // ✅ 토큰 유지 및 복구 (Hydration)
  const TOKEN_KEY = "ACCESS_TOKEN";
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if ((!accessToken || String(accessToken).trim().length === 0) && saved && saved.trim().length > 0) {
      setAccessToken(saved);
    }
    setHydrated(true);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (accessToken && String(accessToken).trim().length > 0) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    }
  }, [accessToken]);

  const [page, setPage] = useState(1);
  const [vo, setVo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 대표이미지 캐시: { [productNo]: attachmentNo }
  const [thumbMap, setThumbMap] = useState({});

  const authHeader = useMemo(() => {
    if (!accessToken) return "";
    return accessToken.startsWith("Bearer ") ? accessToken : "Bearer " + accessToken;
  }, [accessToken]);

  const money = (v) => {
    if (v === null || v === undefined) return "-";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return n.toLocaleString();
  };

  const dt = (v) => {
    if (!v) return "-";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
  };

  const fetchList = async (p) => {
    if (!accessToken || accessToken.trim().length === 0) {
      alert("로그인이 필요합니다");
      navigate("/member/login");
      return;
    }

    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:8080/product/my/page/${p}`, {
        headers: { Authorization: authHeader },
      });

      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed) setAccessToken(renewed);

      setVo(resp.data);

      const list = resp.data?.list || [];
      const productNos = list.map((x) => x.productNo).filter(Boolean);

      const need = productNos.filter((no) => thumbMap[no] === undefined);

      if (need.length > 0) {
        const promises = need.map(async (productNo) => {
          try {
            const aResp = await axios.get(`http://localhost:8080/product/${productNo}/attachments`);
            const first = (aResp.data || [])[0];
            return [productNo, first?.attachmentNo ?? null];
          } catch {
            return [productNo, null];
          }
        });

        const pairs = await Promise.all(promises);
        setThumbMap((prev) => {
          const next = { ...prev };
          for (const [productNo, attachmentNo] of pairs) {
            next[productNo] = attachmentNo;
          }
          return next;
        });
      }
    } catch (err) {
      const status = err.response?.status;
      console.error("내 상품 목록 로딩 실패", err.response || err);
      if (status === 401) alert("토큰 만료/로그인 필요: 다시 로그인 해주세요");
      else alert("내 상품 목록 불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated) return; 
    fetchList(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, page]);

  // ✅ [수정] 상태에 따라 이동할 페이지 분기 처리
  const goDetail = (productNo, status) => {
    if (status === 'BIDDING') {
      // 경매 중이면 -> 경매 현황 페이지(AuctionDetail)로 이동
      navigate(`/product/auction/detail/${productNo}`);
    } else {
      // 그 외(등록중 등) -> 상품 관리 페이지(ProductDetail)로 이동
      navigate(`/product/detail/${productNo}`);
    }
  };

  const goEdit = (productNo) => {
    navigate(`/product/edit/${productNo}`);
  };

  const remove = async (productNo) => {
    if (!window.confirm("삭제할까요?")) return;

    try {
      const resp = await axios.delete(`http://localhost:8080/product/${productNo}`, {
        headers: { Authorization: authHeader },
      });

      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed) setAccessToken(renewed);

      fetchList(page);
    } catch (err) {
      const status = err.response?.status;
      console.error("삭제 실패", err.response || err);
      
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else if (status === 401) {
        alert("토큰 만료/로그인 필요");
      } else {
        alert("삭제 실패");
      }
    }
  };

  const list = vo?.list || [];
  const last = !!vo?.last;

  const IMG_URL = (attachmentNo) => `http://localhost:8080/attachment/${attachmentNo}`;

  if (!hydrated) {
    return <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>로그인 확인 중...</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h2 style={{ marginBottom: 14 }}>내 물품등록 목록</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => navigate("/product/productadd")} style={{ padding: "8px 12px" }}>
          물품등록
        </button>
      </div>

      {loading && <div>로딩중...</div>}

      {!loading && (
        <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f7f7f7" }}>
                <th style={{ padding: 10, textAlign: "left" }}>이미지</th>
                <th style={{ padding: 10, textAlign: "left" }}>상품번호</th>
                <th style={{ padding: 10, textAlign: "left" }}>상품명</th>
                <th style={{ padding: 10, textAlign: "right" }}>시작가</th>
                <th style={{ padding: 10, textAlign: "right" }}>현재가</th>
                <th style={{ padding: 10, textAlign: "left" }}>상태</th>
                <th style={{ padding: 10, textAlign: "left" }}>시작</th>
                <th style={{ padding: 10, textAlign: "left" }}>마감</th>
                <th style={{ padding: 10, textAlign: "center" }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 16, textAlign: "center", color: "#777" }}>
                    등록한 상품이 없습니다
                  </td>
                </tr>
              )}

              {list.map((p) => {
                const thumbNo = thumbMap[p.productNo];
                // 상태가 BIDDING, ENDED, CLOSED면 수정/삭제 불가
                const isLocked = p.status === 'BIDDING' || p.status === 'ENDED' || p.status === 'CLOSED';

                return (
                  <tr key={p.productNo} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: 10, width: 110 }}>
                      {thumbNo ? (
                        <img
                          src={IMG_URL(thumbNo)}
                          alt="thumb"
                          style={{ width: 90, height: 70, objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div style={{ width: 90, height: 70, border: "1px dashed #ccc", borderRadius: 6, fontSize: 12, color: "#777",
                          display: "flex", alignItems: "center", justifyContent: "center" }}>
                          없음
                        </div>
                      )}
                    </td>

                    <td style={{ padding: 10 }}>{p.productNo}</td>
                    <td style={{ padding: 10 }}>
                      <span
                        // ✅ [수정] 클릭 시 상태(status)도 함께 전달하여 분기 처리
                        onClick={() => goDetail(p.productNo, p.status)}
                        style={{ cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }}
                      >
                        {p.name}
                      </span>
                    </td>
                    <td style={{ padding: 10, textAlign: "right" }}>{money(p.startPrice)}</td>
                    <td style={{ padding: 10, textAlign: "right" }}>{money(p.finalPrice)}</td>
                    <td style={{ padding: 10, fontWeight: p.status === 'BIDDING' ? 'bold' : 'normal', color: p.status === 'BIDDING' ? '#ff5722' : 'black' }}>
                      {p.status}
                    </td>
                    <td style={{ padding: 10 }}>{dt(p.startTime)}</td>
                    <td style={{ padding: 10 }}>{dt(p.endTime)}</td>
                    
                    <td style={{ padding: 10, textAlign: "center" }}>
                      <button 
                        onClick={() => !isLocked && goEdit(p.productNo)} 
                        disabled={isLocked}
                        style={{ 
                          padding: "6px 10px", 
                          marginRight: 8,
                          opacity: isLocked ? 0.3 : 1, 
                          cursor: isLocked ? "not-allowed" : "pointer" 
                        }}
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => !isLocked && remove(p.productNo)} 
                        disabled={isLocked}
                        style={{ 
                          padding: "6px 10px", 
                          opacity: isLocked ? 0.3 : 1, 
                          cursor: isLocked ? "not-allowed" : "pointer" 
                        }}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: 12 }}>
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              style={{ padding: "8px 12px" }}
            >
              이전
            </button>
            <div style={{ paddingTop: 8 }}>page {page}</div>
            <button
              onClick={() => setPage((prev) => (last ? prev : prev + 1))}
              disabled={last}
              style={{ padding: "8px 12px" }}
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}