import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";

export default function ProductMyList() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  const [page, setPage] = useState(1);
  const [vo, setVo] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ 대표이미지 캐시: { [productNo]: attachmentNo }
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

      // ✅ 리스트 로딩 후, 각 상품의 첫 첨부(대표이미지) 조회
      const list = resp.data?.list || [];
      const productNos = list.map((x) => x.productNo).filter(Boolean);

      // 이미 가져온 건 재요청 안함
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
    fetchList(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const goDetail = (productNo) => {
    navigate(`/product/detail/${productNo}`);
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
      if (status === 401) alert("토큰 만료/로그인 필요");
      else if (status === 403) alert("본인 상품만 삭제할 수 있습니다");
      else alert("삭제 실패");
    }
  };

  const list = vo?.list || [];
  const last = !!vo?.last;

  // ✅ 너 프로젝트의 “첨부 보여주는 URL”로 맞춰서 바꿔야 함
  // 예: /attachment/{attachmentNo}  또는 /attachment/download/{attachmentNo}
  const IMG_URL = (attachmentNo) => `http://localhost:8080/attachment/${attachmentNo}`;

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
                        onClick={() => goDetail(p.productNo)}
                        style={{ cursor: "pointer", textDecoration: "underline" }}
                      >
                        {p.name}
                      </span>
                    </td>
                    <td style={{ padding: 10, textAlign: "right" }}>{money(p.startPrice)}</td>
                    <td style={{ padding: 10, textAlign: "right" }}>{money(p.finalPrice)}</td>
                    <td style={{ padding: 10 }}>{p.status}</td>
                    <td style={{ padding: 10 }}>{dt(p.startTime)}</td>
                    <td style={{ padding: 10 }}>{dt(p.endTime)}</td>
                    <td style={{ padding: 10, textAlign: "center" }}>
                      <button onClick={() => goEdit(p.productNo)} style={{ padding: "6px 10px", marginRight: 8 }}>
                        수정
                      </button>
                      <button onClick={() => remove(p.productNo)} style={{ padding: "6px 10px" }}>
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
