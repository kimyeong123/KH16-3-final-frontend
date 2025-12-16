import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAtom, useSetAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";

export default function ProductAuctionList() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  // ✅ page는 1이 최소
  const [page, setPage] = useState(1);
  const [vo, setVo] = useState({ list: [], last: true });

  // 좌측 필터/정렬
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("END_SOON"); // 마감임박순 기본

  // ✅ 카테고리(대/소분류 아코디언)
  const [topCategories, setTopCategories] = useState([]);
  const [childrenMap, setChildrenMap] = useState({}); // { parentCode: child[] }
  const [openParents, setOpenParents] = useState({}); // { parentCode: true/false }
  const [selectedTopCode, setSelectedTopCode] = useState(null);
  const [selectedChildCode, setSelectedChildCode] = useState(null);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [loading, setLoading] = useState(false);

  const authHeader = useMemo(() => {
    if (!accessToken) return "";
    return accessToken.startsWith("Bearer ") ? accessToken : "Bearer " + accessToken;
  }, [accessToken]);

  // ✅ 네 AttachmentRestController의 “파일 보기” 엔드포인트에 맞춰라
  // 예: GET /attachment/{attachmentNo}
  const ATT_VIEW = (attachmentNo) => `http://localhost:8080/attachment/${attachmentNo}`;

  const money = (v) => {
    if (v === null || v === undefined) return "-";
    const n = Number(v);
    return Number.isNaN(n) ? String(v) : n.toLocaleString();
  };

  const dt = (v) => {
    if (!v) return "-";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
  };

  const get = (obj, keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  };

  const normalize = (data) => {
    const root = data?.data ?? data;

    if (Array.isArray(root)) return { list: root, last: true };

    if (root && Array.isArray(root.list)) {
      const last = root.last ?? root.isLast ?? root.lastPage ?? root.isLastPage;
      return { list: root.list, last: !!last };
    }

    if (root && Array.isArray(root.content)) {
      const last = root.last ?? root.isLast ?? root.lastPage ?? root.isLastPage;
      return { list: root.content, last: !!last };
    }

    if (root && Array.isArray(root.items)) {
      const last = root.last ?? root.isLast ?? root.lastPage ?? root.isLastPage;
      return { list: root.items, last: !!last };
    }

    if (root?.result && Array.isArray(root.result.list)) {
      const last = root.result.last ?? root.result.isLast ?? root.result.lastPage;
      return { list: root.result.list, last: !!last };
    }

    return { list: [], last: true };
  };

  // ✅ 404 났던 이유: 니 백엔드는 /category (GETMapping) 이지 /category/list 가 아님
  // - 대분류: /category/top
  const loadTopCategories = async () => {
    try {
      const resp = await axios.get("http://localhost:8080/category/top", {
        headers: accessToken ? { Authorization: authHeader } : undefined,
      });
      setTopCategories(resp.data || []);
    } catch (e) {
      console.error("대분류 로딩 실패", e.response || e);
      setTopCategories([]);
    }
  };

  // ✅ 소분류: /category/{parentCode}/children
  const loadChildren = async (parentCode) => {
    if (childrenMap[parentCode]) return; // 캐시
    try {
      const resp = await axios.get(`http://localhost:8080/category/${parentCode}/children`, {
        headers: accessToken ? { Authorization: authHeader } : undefined,
      });
      setChildrenMap((prev) => ({ ...prev, [parentCode]: resp.data || [] }));
    } catch (e) {
      console.error("소분류 로딩 실패", e.response || e);
      setChildrenMap((prev) => ({ ...prev, [parentCode]: [] }));
    }
  };

  const toggleParent = async (parentCode) => {
    setOpenParents((prev) => ({ ...prev, [parentCode]: !prev[parentCode] }));
    // 펼칠 때만 children 로딩
    if (!openParents[parentCode] && !childrenMap[parentCode]) {
      await loadChildren(parentCode);
    }
  };

  const fetchList = async (p) => {
    setLoading(true);
    try {
      const url = `http://localhost:8080/product/auction/page/${p}`;

      const params = {
        q: q || undefined,
        sort: sort || undefined,
        // ✅ 서버가 이해 못해도 상관없게 두지만,
        // 서버에 필터 구현돼있으면 아래 두 개를 활용 가능
        categoryCode: selectedChildCode || selectedTopCode || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
      };

      const resp = await axios.get(url, {
        params,
        headers: accessToken ? { Authorization: authHeader } : undefined,
      });

      // ✅ 토큰 갱신 헤더 있으면 반영
      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed) setAccessToken(renewed);

      const n = normalize(resp.data);

      // ✅ 서버가 정렬/필터 안 해주면 프론트에서 1차 적용
      let list = [...(n.list || [])];

      // 검색(상품명)
      if (q.trim().length > 0) {
        const qq = q.trim().toLowerCase();
        list = list.filter((p) => {
          const name = String(get(p, ["name", "productName", "product_name", "PRODUCT_NAME"]) ?? "").toLowerCase();
          return name.includes(qq);
        });
      }

      // ✅ 카테고리 필터 (소분류 우선)
      if (selectedChildCode) {
        list = list.filter((p) => {
          const cc = get(p, ["categoryCode", "category_code", "CATEGORY_CODE"]);
          return String(cc) === String(selectedChildCode);
        });
      } else if (selectedTopCode) {
        const childs = childrenMap[selectedTopCode] || [];
        const childCodes = new Set(childs.map((c) => String(c.categoryCode ?? c.category_code)));

        list = list.filter((p) => {
          const cc = String(get(p, ["categoryCode", "category_code", "CATEGORY_CODE"]) ?? "");
          return cc === String(selectedTopCode) || childCodes.has(cc);
        });
      }

      // 가격 필터(현재가/시작가 기반)
      const minN = minPrice !== "" ? Number(minPrice) : null;
      const maxN = maxPrice !== "" ? Number(maxPrice) : null;

      if (minN !== null && !Number.isNaN(minN)) {
        list = list.filter((p) => {
          const current =
            get(p, ["finalPrice", "final_price", "FINAL_PRICE"]) ??
            get(p, ["startPrice", "start_price"]);
          return Number(current || 0) >= minN;
        });
      }
      if (maxN !== null && !Number.isNaN(maxN)) {
        list = list.filter((p) => {
          const current =
            get(p, ["finalPrice", "final_price", "FINAL_PRICE"]) ??
            get(p, ["startPrice", "start_price"]);
          return Number(current || 0) <= maxN;
        });
      }

      // 정렬
      if (sort === "END_SOON") {
        list.sort((a, b) => {
          const ea = new Date(get(a, ["endTime", "end_time"])).getTime();
          const eb = new Date(get(b, ["endTime", "end_time"])).getTime();
          return (ea || 0) - (eb || 0);
        });
      } else if (sort === "NEW") {
        list.sort((a, b) => {
          const ta = new Date(get(a, ["registrationTime", "registration_time", "startTime", "start_time"])).getTime();
          const tb = new Date(get(b, ["registrationTime", "registration_time", "startTime", "start_time"])).getTime();
          return (tb || 0) - (ta || 0);
        });
      } else if (sort === "PRICE_HIGH") {
        list.sort((a, b) => {
          const pa = Number(get(a, ["finalPrice", "final_price"]) ?? get(a, ["startPrice", "start_price"]) ?? 0);
          const pb = Number(get(b, ["finalPrice", "final_price"]) ?? get(b, ["startPrice", "start_price"]) ?? 0);
          return pb - pa;
        });
      } else if (sort === "PRICE_LOW") {
        list.sort((a, b) => {
          const pa = Number(get(a, ["finalPrice", "final_price"]) ?? get(a, ["startPrice", "start_price"]) ?? 0);
          const pb = Number(get(b, ["finalPrice", "final_price"]) ?? get(b, ["startPrice", "start_price"]) ?? 0);
          return pa - pb;
        });
      }

      setVo({ list, last: !!n.last });
    } catch (err) {
      console.error("경매 목록 로딩 실패", err.response || err);
      alert("경매 목록 불러오기 실패");
      setVo({ list: [], last: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopCategories();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchList(page);
    // eslint-disable-next-line
  }, [page]);

  const list = vo?.list || [];
  const last = !!vo?.last;

  const goDetail = (productNo) => {
    navigate(`/product/auction/detail/${productNo}`);
  };

  const applyFilter = () => {
    setPage(1);
    fetchList(1);
  };

  const resetFilter = () => {
    setQ("");
    setSort("END_SOON");
    setSelectedTopCode(null);
    setSelectedChildCode(null);
    setMinPrice("");
    setMaxPrice("");
    setOpenParents({});
    setPage(1);
    fetchList(1);
  };

  // ✅ 썸네일: list에서 attachments가 오면 첫 번째로 표시
  // (서버가 list에서 attachment를 안 주면 빈 박스로 나오는 게 정상)
  const resolveThumbNo = (p) => {
    const atts =
      get(p, ["attachments"]) ||
      get(p, ["attachmentList"]) ||
      get(p, ["attachment_list"]) ||
      null;

    if (Array.isArray(atts) && atts.length > 0) {
      const first = atts[0];
      return first?.attachmentNo ?? first?.attachment_no ?? first?.no ?? null;
    }
    // 혹시 product가 thumbnailAttachmentNo 같은 걸 준다면 여기서 처리
    const direct = get(p, ["thumbnailAttachmentNo", "thumbnail_attachment_no"]);
    return direct ?? null;
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 16px" }}>
      {/* 상단 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 26, fontWeight: 900, textAlign: "left" }}>경매 리스트</div>

        {/* 정렬 */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="END_SOON">마감임박순</option>
            <option value="NEW">신규경매순</option>
            <option value="PRICE_HIGH">높은가격순</option>
            <option value="PRICE_LOW">낮은가격순</option>
          </select>

          <button onClick={applyFilter} style={{ padding: "8px 12px" }}>
            적용
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18 }}>
        {/* 좌측 필터 */}
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14, background: "white" }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>필터</div>

          {/* 검색 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>검색</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="상품명 검색"
              style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          {/* ✅ 카테고리: 아코디언 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>카테고리</div>

            {/* 전체 */}
            <div
              onClick={() => {
                setSelectedTopCode(null);
                setSelectedChildCode(null);
              }}
              style={{
                padding: "10px 8px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: selectedTopCode === null && selectedChildCode === null ? 900 : 600,
                background: selectedTopCode === null && selectedChildCode === null ? "#f6f7f9" : "transparent",
              }}
            >
              전체
            </div>

            <div style={{ borderTop: "1px solid #eee", marginTop: 8, paddingTop: 8 }}>
              {topCategories.map((top) => {
                const topCode = top.categoryCode ?? top.category_code;
                const isOpen = !!openParents[topCode];
                const children = childrenMap[topCode] || [];

                return (
                  <div key={topCode} style={{ marginBottom: 6 }}>
                    {/* 대분류 라인 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 8px",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: String(selectedTopCode) === String(topCode) && !selectedChildCode ? "#f6f7f9" : "transparent",
                      }}
                      onClick={() => {
                        // 대분류 선택
                        setSelectedTopCode(topCode);
                        setSelectedChildCode(null);
                        toggleParent(topCode);
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>{top.name}</div>
                      <div style={{ fontSize: 12, color: "#999" }}>{isOpen ? "▲" : "▼"}</div>
                    </div>

                    {/* 소분류 */}
                    {isOpen && (
                      <div style={{ paddingLeft: 14, marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                        {/* 대분류 전체(=해당 대분류만 선택) */}
                        <div
                          onClick={() => {
                            setSelectedTopCode(topCode);
                            setSelectedChildCode(null);
                          }}
                          style={{
                            padding: "8px 8px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: String(selectedTopCode) === String(topCode) && !selectedChildCode ? 900 : 600,
                            background: String(selectedTopCode) === String(topCode) && !selectedChildCode ? "#f6f7f9" : "transparent",
                          }}
                        >
                          전체
                        </div>

                        {children.map((c) => {
                          const childCode = c.categoryCode ?? c.category_code;
                          const active = String(selectedChildCode) === String(childCode);

                          return (
                            <div
                              key={childCode}
                              onClick={() => {
                                setSelectedTopCode(topCode);
                                setSelectedChildCode(childCode);
                              }}
                              style={{
                                padding: "8px 8px",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: active ? 900 : 600,
                                background: active ? "#f6f7f9" : "transparent",
                              }}
                            >
                              {c.name}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 가격 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>가격</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="최소"
                style={{ width: "50%", padding: "9px 10px", borderRadius: 8, border: "1px solid #ddd" }}
              />
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="최대"
                style={{ width: "50%", padding: "9px 10px", borderRadius: 8, border: "1px solid #ddd" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={resetFilter} style={{ flex: 1, padding: "10px 12px" }}>
              초기화
            </button>
            <button onClick={applyFilter} style={{ flex: 1, padding: "10px 12px" }}>
              적용
            </button>
          </div>
        </div>

        {/* 우측 카드 영역 */}
        <div>
          {loading && <div style={{ padding: 20 }}>로딩중...</div>}

          {!loading && list.length === 0 && (
            <div style={{ padding: 30, border: "1px solid #eee", borderRadius: 12, background: "white", color: "#777" }}>
              진행중인 경매가 없습니다
            </div>
          )}

          {!loading && list.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {list.map((p, idx) => {
                const productNo = get(p, ["productNo", "product_no", "PRODUCT_NO"]);
                const name = get(p, ["name", "productName", "product_name", "PRODUCT_NAME"]) ?? "(제목 없음)";
                const current =
                  get(p, ["finalPrice", "final_price", "FINAL_PRICE"]) ??
                  get(p, ["startPrice", "start_price"]) ??
                  0;
                const endTime = get(p, ["endTime", "end_time", "END_TIME"]);
                const instantPrice = get(p, ["instantPrice", "instant_price", "INSTANT_PRICE"]);

                const thumbNo = resolveThumbNo(p);

                return (
                  <div
                    key={productNo ?? idx}
                    onClick={() => productNo && goDetail(productNo)}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "white",
                      cursor: productNo ? "pointer" : "default",
                    }}
                  >
                    {/* ✅ 썸네일 */}
                    <div style={{ height: 170, background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {thumbNo ? (
                        <img
                          src={ATT_VIEW(thumbNo)}
                          alt="thumb"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div style={{ color: "#bbb", fontSize: 12 }}>(이미지 없음)</div>
                      )}
                    </div>

                    <div style={{ padding: 12 }}>
                      <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.2, marginBottom: 8 }}>
                        {name}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                        <div style={{ fontSize: 13, color: "#666" }}>현재가</div>
                        <div style={{ fontSize: 16, fontWeight: 900 }}>{money(current)}원</div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                        <div style={{ fontSize: 13, color: "#666" }}>즉시가</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                          {instantPrice ? `${money(instantPrice)}원` : "-"}
                        </div>
                      </div>

                      <div style={{ fontSize: 12, color: "#888" }}>마감: {dt(endTime)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 페이지네이션 */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: 18 }}>
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              style={{ padding: "9px 14px", minWidth: 90 }}
            >
              이전
            </button>

            <div style={{ paddingTop: 10, minWidth: 80, textAlign: "center" }}>page {page}</div>

            <button
              onClick={() => setPage((prev) => (last ? prev : prev + 1))}
              disabled={last}
              style={{ padding: "9px 14px", minWidth: 90 }}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
