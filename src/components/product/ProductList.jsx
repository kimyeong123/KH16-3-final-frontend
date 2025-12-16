// src/components/product/ProductList.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";

export default function ProductList() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 검색/정렬(간단)
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("latest"); // latest | priceAsc | priceDesc

  const authHeader = accessToken?.startsWith("Bearer ")
    ? accessToken
    : "Bearer " + (accessToken || "");

  const load = async () => {
    setLoading(true);
    try {
      // ✅ 토큰이 있을 때만 Authorization 붙인다
      const resp = await axios.get("http://localhost:8080/product/", {
        headers: accessToken ? { Authorization: authHeader } : undefined,
      });

      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed) setAccessToken(renewed);

      setList(resp.data || []);
    } catch (err) {
      console.error("목록 로딩 실패", err.response || err);
      const status = err.response?.status;
      if (status === 401) alert("로그인이 필요합니다(토큰 만료 가능)");
      else alert("상품 목록을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    let arr = [...list];

    if (k) {
      arr = arr.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        return name.includes(k) || desc.includes(k);
      });
    }

    if (sort === "latest") {
      arr.sort((a, b) => Number(b.productNo ?? b.product_no ?? 0) - Number(a.productNo ?? a.product_no ?? 0));
    } else if (sort === "priceAsc") {
      arr.sort((a, b) => Number(a.startPrice ?? a.start_price ?? 0) - Number(b.startPrice ?? b.start_price ?? 0));
    } else if (sort === "priceDesc") {
      arr.sort((a, b) => Number(b.startPrice ?? b.start_price ?? 0) - Number(a.startPrice ?? a.start_price ?? 0));
    }

    return arr;
  }, [list, keyword, sort]);

  if (loading) {
    return <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>로딩중...</div>;
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>상품 목록</h2>
        <button onClick={load} style={{ padding: "8px 12px" }}>새로고침</button>
      </div>

      {/* 검색/정렬 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="상품명/설명 검색"
          style={{ flex: 1, padding: 10 }}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: 10 }}>
          <option value="latest">최신순</option>
          <option value="priceAsc">시작가 낮은순</option>
          <option value="priceDesc">시작가 높은순</option>
        </select>
      </div>

      {/* 리스트 */}
      {filtered.length === 0 ? (
        <div style={{ padding: 24, border: "1px solid #ddd", borderRadius: 8 }}>
          검색 결과가 없습니다.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {filtered.map((p) => {
            const productNo = p.productNo ?? p.product_no;
            const startPrice = p.startPrice ?? p.start_price;
            const instantPrice = p.instantPrice ?? p.instant_price;
            const status = p.status ?? "";
            const name = p.name ?? "";

            return (
              <div
                key={productNo}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 14,
                  cursor: "pointer",
                  background: "white",
                }}
                onClick={() => navigate(`/product/detail/${productNo}`)}
              >
                <div style={{ fontSize: 12, color: "#777", marginBottom: 6 }}>
                  #{productNo} · {status}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>
                  {name}
                </div>

                <div style={{ fontSize: 13, color: "#333", marginBottom: 6 }}>
                  시작가: <b>{Number(startPrice || 0).toLocaleString()}</b>
                </div>
                <div style={{ fontSize: 13, color: "#333" }}>
                  즉시가: {instantPrice ? <b>{Number(instantPrice).toLocaleString()}</b> : "없음"}
                </div>

                <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#888" }}>상세보기</span>
                  <span style={{ fontSize: 12, color: "#888" }}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
