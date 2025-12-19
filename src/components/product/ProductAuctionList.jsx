import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";

export default function ProductAuctionList() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  // === 토큰 유지 ===
  const TOKEN_KEY = "ACCESS_TOKEN";
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (
      (!accessToken || String(accessToken).trim().length === 0) &&
      saved &&
      saved.trim().length > 0
    ) {
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

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAccessToken("");
  };

  // === 상태 관리 ===
  const [page, setPage] = useState(1);
  const [vo, setVo] = useState({ list: [], last: true });
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  // 필터 상태
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("END_SOON");

  // 카테고리
  const [topCategories, setTopCategories] = useState([]);
  const [childrenMap, setChildrenMap] = useState({});
  const [openParents, setOpenParents] = useState({});
  const [selectedTopCode, setSelectedTopCode] = useState(null);
  const [selectedChildCode, setSelectedChildCode] = useState(null);

  // 가격
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const authHeader = useMemo(() => {
    if (!accessToken) return "";
    return accessToken.startsWith("Bearer ")
      ? accessToken
      : "Bearer " + accessToken;
  }, [accessToken]);

  // === 이미지 관련 ===
  const ATT_VIEW = (attachmentNo) =>
    `http://localhost:8080/attachment/${attachmentNo}`;
  const [thumbNoByProduct, setThumbNoByProduct] = useState({});
  const [thumbMap, setThumbMap] = useState({});
  const revokeRef = useRef([]);

  useEffect(() => {
    return () => {
      revokeRef.current.forEach((u) => URL.revokeObjectURL(u));
      revokeRef.current = [];
    };
  }, []);

  // === 유틸 ===
  const money = (v) => (v ? Number(v).toLocaleString() : "-");
  const dt = (v) => (v ? new Date(v).toLocaleString() : "-");
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
    // API 응답 구조에 따라 list 추출
    const list = root?.list || root?.content || root?.data || [];
    const last = root?.last ?? root?.lastPage ?? true;
    return { list, last };
  };

  // === 카테고리 로드 ===
  const loadTopCategories = async () => {
    try {
      const resp = await axios.get("http://localhost:8080/category/top");
      setTopCategories(resp.data || []);
    } catch (e) {
      console.error("대분류 로드 실패", e);
    }
  };

  const loadChildren = async (parentCode) => {
    if (childrenMap[parentCode]) return;
    try {
      const resp = await axios.get(
        `http://localhost:8080/category/${parentCode}/children`
      );
      setChildrenMap((prev) => ({ ...prev, [parentCode]: resp.data || [] }));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleParent = async (parentCode) => {
    setOpenParents((prev) => ({ ...prev, [parentCode]: !prev[parentCode] }));
    if (!openParents[parentCode] && !childrenMap[parentCode]) {
      await loadChildren(parentCode);
    }
  };

  // === [핵심] 데이터 불러오기 ===
  const fetchList = async (targetPage) => {
    setLoading(true);
    setErrorInfo(null);

    try {
      // 정렬값 변환
      let serverSort = sort;
      if (sort === "PRICE_HIGH") serverSort = "PRICE_DESC";
      else if (sort === "PRICE_LOW") serverSort = "PRICE_ASC";

      const params = {
        q: q || null,
        sort: serverSort || null,
        category: selectedChildCode || selectedTopCode || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
      };

      const resp = await axios.get(
        `http://localhost:8080/product/auction/page/${targetPage}`,
        {
          params,
          headers: accessToken ? { Authorization: authHeader } : undefined,
        }
      );

      const n = normalize(resp.data);
      setVo({ list: n.list, last: n.last });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        if (accessToken) clearToken();
        setErrorInfo({ status: 401, message: "로그인 필요" });
      } else {
        setErrorInfo({ status: status || "?", message: "로딩 실패" });
      }
      setVo({ list: [], last: true });
    } finally {
      setLoading(false);
    }
  };

  // 1. 초기 로드
  useEffect(() => {
    loadTopCategories();
  }, []);

  // 2. 페이지 변경 시 로드
  useEffect(() => {
    if (!hydrated) return;
    fetchList(page);
    // eslint-disable-next-line
  }, [hydrated, page]);

  // =================================================================
  //  🔥 [여기부터] 요즘 스타일: 실시간 반영 로직
  // =================================================================

  // 3. [즉시 반영] 정렬(sort)이나 카테고리가 바뀌면 바로 검색
  useEffect(() => {
    if (!hydrated) return;
    setPage(1); // 1페이지로 리셋
    fetchList(1);
    // eslint-disable-next-line
  }, [sort, selectedTopCode, selectedChildCode]);

  // 4. [지연 반영] 검색어(q), 가격(min, max)은 타자 칠 때마다 요청하면 안되니까 0.5초 기다림 (디바운싱)
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      setPage(1);
      fetchList(1);
    }, 500); // 0.5초 딜레이

    return () => clearTimeout(timer); // 0.5초 안에 또 입력하면 타이머 리셋
    // eslint-disable-next-line
  }, [q, minPrice, maxPrice]);

  // =================================================================

  // 필터 초기화
  const resetFilter = () => {
    setQ("");
    setSort("END_SOON");
    setSelectedTopCode(null);
    setSelectedChildCode(null);
    setCurrnetPrice("");
    setMaxPrice("");
    setOpenParents({});
    setPage(1);
    // 상태가 바뀌면 위 useEffect들이 알아서 fetchList를 호출하므로 여기서 호출 안 해도 됨
  };

  const goDetail = (no) => navigate(`/product/auction/detail/${no}`);

  // === 썸네일 로직 ===
  const resolveThumbNo = (p) => {
    const atts = get(p, ["attachments", "attachmentList"]);
    if (Array.isArray(atts) && atts.length > 0) return atts[0].attachmentNo;
    return get(p, ["thumbnailAttachmentNo"]);
  };

  // 썸네일 번호 찾기
  useEffect(() => {
    if (!hydrated || !vo.list.length) return;
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
        const res = await Promise.all(
          chunk.map(async (no) => {
            try {
              const r = await axios.get(
                `http://localhost:8080/product/${no}/attachments`
              );
              return { no, attNo: r.data?.[0]?.attachmentNo };
            } catch {
              return { no, attNo: null };
            }
          })
        );
        if (!alive) return;
        const patch = {};
        res.forEach((x) => {
          if (x.attNo) patch[x.no] = x.attNo;
        });
        setThumbNoByProduct((prev) => ({ ...prev, ...patch }));
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [vo.list, hydrated]);

  // Blob URL 생성
  useEffect(() => {
    if (!hydrated || !vo.list.length) return;
    let alive = true;
    const run = async () => {
      const needed = [];
      for (const p of vo.list) {
        const pNo = get(p, ["productNo", "product_no"]);
        const attNo = resolveThumbNo(p) || thumbNoByProduct[pNo];
        if (attNo && !thumbMap[attNo]) needed.push(attNo);
      }
      const uniq = [...new Set(needed)];
      if (uniq.length === 0) return;

      for (let i = 0; i < uniq.length; i += 6) {
        const chunk = uniq.slice(i, i + chunkSize);
        const res = await Promise.all(
          chunk.map(async (attNo) => {
            try {
              const r = await axios.get(ATT_VIEW(attNo), {
                responseType: "blob",
                headers: accessToken
                  ? { Authorization: authHeader }
                  : undefined,
              });
              return { attNo, url: URL.createObjectURL(r.data) };
            } catch {
              return { attNo, url: null };
            }
          })
        );
        if (!alive) return;
        const patch = {};
        res.forEach((x) => {
          if (x.url) {
            patch[x.attNo] = x.url;
            revokeRef.current.push(x.url);
          }
        });
        setThumbMap((prev) => ({ ...prev, ...patch }));
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [vo.list, thumbNoByProduct, hydrated, accessToken]);

  // === 렌더링 ===
  const list = vo.list;
  const last = vo.last;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 16px" }}>
      {/* 상단 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 900 }}>경매 리스트</div>

        {/* 정렬 (적용 버튼 삭제됨) */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          >
            <option value="END_SOON">마감임박순</option>
            <option value="NEW">신규경매순</option>
            <option value="PRICE_HIGH">높은가격순</option>
            <option value="PRICE_LOW">낮은가격순</option>
          </select>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18 }}
      >
        {/* 좌측 필터 */}
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 14,
            background: "white",
            height: "fit-content",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 10 }}>필터</div>

          {/* 검색 (타자 치면 0.5초 뒤 자동 반영) */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
              검색
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="상품명 검색"
              style={{
                width: "100%",
                padding: "9px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>

          {/* 카테고리 (누르면 바로 반영) */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
              카테고리
            </div>
            <div
              onClick={() => {
                setSelectedTopCode(null);
                setSelectedChildCode(null);
              }}
              style={{
                padding: "10px 8px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: !selectedTopCode ? 900 : 600,
                background: !selectedTopCode ? "#f6f7f9" : "transparent",
              }}
            >
              전체
            </div>
            <div
              style={{
                borderTop: "1px solid #eee",
                marginTop: 8,
                paddingTop: 8,
              }}
            >
              {topCategories.map((top) => {
                const topCode = top.categoryCode ?? top.category_code;
                const isOpen = !!openParents[topCode];
                const children = childrenMap[topCode] || [];
                const isActive = String(selectedTopCode) === String(topCode);

                return (
                  <div key={topCode} style={{ marginBottom: 6 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 8px",
                        borderRadius: 8,
                        cursor: "pointer",
                        background:
                          isActive && !selectedChildCode
                            ? "#f6f7f9"
                            : "transparent",
                      }}
                      onClick={() => {
                        setSelectedTopCode(topCode);
                        setSelectedChildCode(null);
                        toggleParent(topCode);
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>{top.name}</div>
                      <div style={{ fontSize: 12, color: "#999" }}>
                        {isOpen ? "▲" : "▼"}
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ paddingLeft: 14, marginTop: 4 }}>
                        <div
                          onClick={() => {
                            setSelectedTopCode(topCode);
                            setSelectedChildCode(null);
                          }}
                          style={{
                            padding: "8px",
                            cursor: "pointer",
                            fontWeight:
                              isActive && !selectedChildCode ? 900 : 600,
                          }}
                        >
                          전체
                        </div>
                        {children.map((c) => {
                          const cCode = c.categoryCode ?? c.category_code;
                          const active =
                            String(selectedChildCode) === String(cCode);
                          return (
                            <div
                              key={cCode}
                              onClick={() => {
                                setSelectedTopCode(topCode);
                                setSelectedChildCode(cCode);
                              }}
                              style={{
                                padding: "8px",
                                cursor: "pointer",
                                fontWeight: active ? 900 : 600,
                                background: active ? "#f6f7f9" : "transparent",
                                borderRadius: 8,
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

          {/* 가격 (입력 멈추면 0.5초 뒤 자동 반영) */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
              가격
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="최소"
                type="number"
                style={{
                  width: "50%",
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="최대"
                type="number"
                style={{
                  width: "50%",
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            </div>
          </div>

          {/* 버튼: 초기화만 남김 */}
          <div>
            <button
              onClick={resetFilter}
              style={{
                width: "100%",
                padding: "10px",
                background: "#f5f5f5",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              초기화
            </button>
          </div>
        </div>

        {/* 우측 리스트 */}
        <div>
          {loading && <div style={{ padding: 20 }}>로딩중...</div>}
          {!loading && list.length === 0 && (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                border: "1px solid #eee",
                borderRadius: 12,
                background: "white",
                color: "#777",
              }}
            >
              조건에 맞는 경매가 없습니다.
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {list.map((p, idx) => {
              const pNo = get(p, ["productNo", "product_no"]);
              const name = get(p, ["name", "productName"]) ?? "제목없음";
              const price =
                get(p, ["finalPrice", "final_price"]) ||
                get(p, ["currentPrice", "current_price"]) ||
                0;
              const instant = get(p, ["instantPrice", "instant_price"]);
              const end = get(p, ["endTime", "end_time"]);

              const attNo = resolveThumbNo(p) || thumbNoByProduct[pNo];
              const src = thumbMap[attNo];

              return (
                <div
                  key={pNo ?? idx}
                  onClick={() => pNo && goDetail(pNo)}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      height: 170,
                      background: "#fafafa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {attNo ? (
                      src ? (
                        <img
                          src={src}
                          alt="thumb"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div style={{ fontSize: 12, color: "#bbb" }}>...</div>
                      )
                    ) : (
                      <div style={{ fontSize: 12, color: "#bbb" }}>
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 12 }}>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 15,
                        marginBottom: 8,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: "#666" }}>현재가</span>
                      <span style={{ fontWeight: 900 }}>{money(price)}원</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      <span style={{ color: "#666" }}>즉시가</span>
                      <span>{instant ? `${money(instant)}원` : "-"}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#888",
                        marginTop: 8,
                        textAlign: "right",
                      }}
                    >
                      마감: {dt(end)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              padding: 18,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ padding: "9px 14px" }}
            >
              이전
            </button>
            <div style={{ paddingTop: 10 }}>page {page}</div>
            <button
              onClick={() => setPage((p) => (last ? p : p + 1))}
              disabled={last}
              style={{ padding: "9px 14px" }}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
