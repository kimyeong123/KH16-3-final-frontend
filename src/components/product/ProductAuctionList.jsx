import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";

export default function ProductAuctionList() {
    const navigate = useNavigate();
    const [accessToken, setAccessToken] = useAtom(accessTokenState);

    // === 상태 관리 ===
    const [page, setPage] = useState(1);
    const [vo, setVo] = useState({ list: [], last: true });
    const [loading, setLoading] = useState(false);

    // 필터 상태
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("END_SOON");
    const [topCategories, setTopCategories] = useState([]);
    const [childrenMap, setChildrenMap] = useState({});
    const [openParents, setOpenParents] = useState({});
    const [selectedTopCode, setSelectedTopCode] = useState(null);
    const [selectedChildCode, setSelectedChildCode] = useState(null);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // 인증 헤더
    const authHeader = useMemo(() => {
        if (!accessToken) return "";
        return accessToken.startsWith("Bearer ") ? accessToken : "Bearer " + accessToken;
    }, [accessToken]);

    // === 이미지/유틸 로직 ===
    const ATT_VIEW = (no) => `http://localhost:8080/attachment/${no}`;
    const [thumbNoByProduct, setThumbNoByProduct] = useState({});
    const [thumbMap, setThumbMap] = useState({});
    const revokeRef = useRef([]);

    const money = (v) => (v ? Number(v).toLocaleString() : "0");
    const dt = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return `${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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
        const list = root?.list || root?.content || root?.data || [];
        const last = root?.last ?? root?.lastPage ?? true;
        return { list, last };
    };

    // === 🔥 귀여운 이모지 매핑 ===
    const getEmoji = (name) => {
        if (name.includes("예술")) return "🎨";
        if (name.includes("도서")) return "📚";
        if (name.includes("근현대")) return "📻";
        if (name.includes("세컨핸드")) return "🛍️";
        if (name.includes("컬렉터블")) return "🧸";
        return "📦"; 
    };

    // === 데이터 로딩 ===
    const loadTopCategories = async () => {
        try {
            const resp = await axios.get("http://localhost:8080/category/top");
            setTopCategories(resp.data || []);
        } catch (e) { console.error(e); }
    };

    const toggleParent = async (parentCode) => {
        setOpenParents((prev) => ({ ...prev, [parentCode]: !prev[parentCode] }));
        if (!openParents[parentCode] && !childrenMap[parentCode]) {
            try {
                const resp = await axios.get(`http://localhost:8080/category/${parentCode}/children`);
                setChildrenMap(prev => ({ ...prev, [parentCode]: resp.data || [] }));
            } catch (e) { console.error(e); }
        }
    };

    const fetchList = async (targetPage) => {
        setLoading(true);
        try {
            let serverSort = sort;
            if (sort === "PRICE_HIGH") serverSort = "PRICE_DESC";
            else if (sort === "PRICE_LOW") serverSort = "PRICE_ASC";

            const params = {
                // 🔥 [핵심] 20개씩 요청! (백엔드 PageVO가 받아줘야 함)
                size: 20,
                
                q: q || null,
                sort: serverSort || null,
                category: selectedChildCode || selectedTopCode || null,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
            };

            // 🔥 [주소 복구] 화면 잘 나오던 주소 사용
            const resp = await axios.get(`http://localhost:8080/product/auction/page/${targetPage}`, {
                params,
                headers: accessToken ? { Authorization: authHeader } : undefined,
            });

            const n = normalize(resp.data);
            setVo({ list: n.list, last: n.last });
        } catch (err) {
            setVo({ list: [], last: true });
        } finally { setLoading(false); }
    };

    useEffect(() => { loadTopCategories(); }, []);
    useEffect(() => { fetchList(page); }, [page]);
    useEffect(() => { setPage(1); fetchList(1); }, [sort, selectedTopCode, selectedChildCode]);
    useEffect(() => {
        const timer = setTimeout(() => { setPage(1); fetchList(1); }, 500);
        return () => clearTimeout(timer);
    }, [q, minPrice, maxPrice]);

    const resetFilter = () => {
        setQ(""); setSort("END_SOON"); setSelectedTopCode(null); setSelectedChildCode(null);
        setMinPrice(""); setMaxPrice(""); setOpenParents({}); setPage(1);
    };

    // === 썸네일 로직 ===
    useEffect(() => {
        if (!vo.list.length) return;
        const run = async () => {
            const targets = vo.list.filter(p => {
                const pNo = get(p, ["productNo", "product_no"]);
                return pNo && !thumbNoByProduct[pNo];
            }).map(p => get(p, ["productNo", "product_no"]));
            
            if (targets.length === 0) return;
            for (let i = 0; i < targets.length; i += 6) {
                const chunk = targets.slice(i, i + 6);
                const res = await Promise.all(chunk.map(async (no) => {
                    try {
                        const r = await axios.get(`http://localhost:8080/product/${no}/attachments`);
                        return { no, attNo: r.data?.[0]?.attachmentNo };
                    } catch { return { no, attNo: null }; }
                }));
                const patch = {};
                res.forEach(x => { if(x.attNo) patch[x.no] = x.attNo; });
                setThumbNoByProduct(prev => ({ ...prev, ...patch }));
            }
        };
        run();
    }, [vo.list]);

    useEffect(() => {
        if (!vo.list.length) return;
        const run = async () => {
            const needed = vo.list.map(p => {
                const pNo = get(p, ["productNo", "product_no"]);
                const attNo = get(p, ["thumbnailAttachmentNo"]) || thumbNoByProduct[pNo];
                return attNo;
            }).filter(no => no && !thumbMap[no]);
            const uniq = [...new Set(needed)];
            if (uniq.length === 0) return;

            for (let i = 0; i < uniq.length; i += 6) {
                const chunk = uniq.slice(i, i + 6);
                const res = await Promise.all(chunk.map(async (attNo) => {
                    try {
                        const r = await axios.get(ATT_VIEW(attNo), { responseType: "blob" });
                        return { attNo, url: URL.createObjectURL(r.data) };
                    } catch { return { attNo, url: null }; }
                }));
                const patch = {};
                res.forEach(x => { if(x.url) { patch[x.attNo] = x.url; revokeRef.current.push(x.url); }});
                setThumbMap(prev => ({ ...prev, ...patch }));
            }
        };
        run();
    }, [vo.list, thumbNoByProduct]);

    // === 스타일 정의 ===
    const styles = {
        // 🔥 1600px로 넓혀서 4개 들어가게 함
        container: { maxWidth: 1600, margin: "40px auto", padding: "0 20px", fontFamily: "'Pretendard', sans-serif" },
        
        sidebar: { width: "240px", background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "20px", height: "fit-content", position: "sticky", top: "20px" },
        card: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", display: "flex", flexDirection: "column" },
        imgWrapper: { position: "relative", width: "100%", paddingTop: "75%", background: "#f8f9fa", overflow: "hidden" },
        priceText: { color: "#e63946", fontWeight: "800", fontSize: "17px" },
        badge: { position: "absolute", top: "10px", left: "10px", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" },
        categoryItem: (isActive) => ({
            padding: "10px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: isActive ? "800" : "500",
            color: isActive ? "#333" : "#666", background: isActive ? "#f1f3f5" : "transparent", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px"
        }),
        subCategory: (isActive) => ({
            padding: "8px 12px 8px 24px", fontSize: "13px", cursor: "pointer", color: isActive ? "#e63946" : "#888", fontWeight: isActive ? "700" : "400"
        }),
        paginationBtn: (disabled) => ({
            padding: "8px 16px", border: "1px solid #ddd", background: "#fff", borderRadius: "6px", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1, fontSize: "14px"
        }),
        iconBar: { display: "flex", justifyContent: "center", gap: "30px", marginBottom: "40px" },
        iconItem: (isActive) => ({ textAlign: "center", cursor: "pointer", opacity: isActive ? 1 : 0.6 }),
        iconCircle: (isActive) => ({ width: "60px", height: "60px", borderRadius: "50%", background: isActive ? "#333" : "#f1f3f5", color: isActive ? "#fff" : "#333", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px", marginBottom:"8px" })
    };

    return (
        <div style={styles.container}>
            {/* 상단 카테고리 아이콘 바 */}
            <div style={styles.iconBar}>
                <div style={styles.iconItem(!selectedTopCode)} onClick={resetFilter}>
                    <div style={styles.iconCircle(!selectedTopCode)}>🏠</div>
                    <div style={{fontSize:"13px", fontWeight:"bold"}}>전체</div>
                </div>
                {topCategories.map(top => {
                    const topCode = top.categoryCode ?? top.category_code;
                    const isActive = String(selectedTopCode) === String(topCode);
                    return (
                        <div key={topCode} style={styles.iconItem(isActive)} onClick={() => { setSelectedTopCode(topCode); setSelectedChildCode(null); }}>
                            <div style={styles.iconCircle(isActive)}>{getEmoji(top.name)}</div>
                            <div style={{fontSize:"13px", fontWeight:"bold"}}>{top.name}</div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h2 style={{ fontSize: "28px", fontWeight: "900", margin: 0 }}>경매 리스트 ({vo.list.length})</h2>
                <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}>
                    <option value="END_SOON">마감임박순</option>
                    <option value="NEW">신규경매순</option>
                    <option value="PRICE_HIGH">높은가격순</option>
                    <option value="PRICE_LOW">낮은가격순</option>
                </select>
            </div>

            <div style={{ display: "flex", gap: "30px" }}>
                {/* 좌측 사이드바 */}
                <aside style={styles.sidebar}>
                    <div style={{ fontWeight: "800", fontSize: "16px", marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
                        필터 <span style={{ fontSize: "12px", color: "#e63946", cursor: "pointer" }} onClick={resetFilter}>초기화</span>
                    </div>
                    
                    <div style={{ marginBottom: "25px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#999", marginBottom: "10px" }}>상품명 검색</div>
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="검색어를 입력하세요" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
                    </div>

                    <div style={{ marginBottom: "25px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#999", marginBottom: "10px" }}>카테고리</div>
                        <div style={styles.categoryItem(!selectedTopCode)} onClick={() => { setSelectedTopCode(null); setSelectedChildCode(null); }}>전체 보기</div>
                        {topCategories.map((top) => {
                            const topCode = top.categoryCode ?? top.category_code;
                            const isOpen = !!openParents[topCode];
                            const isActive = String(selectedTopCode) === String(topCode);
                            return (
                                <div key={topCode}>
                                    <div style={styles.categoryItem(isActive)} onClick={() => toggleParent(topCode)}>
                                        <span>{getEmoji(top.name)} {top.name}</span> 
                                        <span>{isOpen ? "−" : "+"}</span>
                                    </div>
                                    {isOpen && (childrenMap[topCode] || []).map(c => {
                                        const cCode = c.categoryCode ?? c.category_code;
                                        const isChildActive = String(selectedChildCode) === String(cCode);
                                        return (
                                            <div key={cCode} style={styles.subCategory(isChildActive)} onClick={() => { setSelectedTopCode(topCode); setSelectedChildCode(cCode); }}>
                                                • {c.name}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    <div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#999", marginBottom: "10px" }}>가격 범위</div>
                        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="최소" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }} />
                            <span style={{ color: "#ccc" }}>~</span>
                            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="최대" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }} />
                        </div>
                    </div>
                </aside>

                {/* 우측 리스트 영역 */}
                <main style={{ flex: 1 }}>
                    {loading && <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>경매 상품을 불러오는 중...</div>}
                    {!loading && vo.list.length === 0 && (
                        <div style={{ textAlign: "center", padding: "100px", background: "#f8f9fa", borderRadius: "12px", color: "#666" }}>찾으시는 경매 조건에 맞는 상품이 없습니다.</div>
                    )}

                    {/* 🔥 [핵심] repeat(4, 1fr)로 4개씩 고정! */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "25px" }}>
                        {vo.list.map((p, idx) => {
                            const pNo = get(p, ["productNo", "product_no"]);
                            const name = get(p, ["name", "productName"]) ?? "제목 없음";
                            const price = get(p, ["currentPrice", "current_price"]) || get(p, ["startPrice", "start_price"]) || 0;
                            const attNo = get(p, ["thumbnailAttachmentNo"]) || thumbNoByProduct[pNo];
                            const src = thumbMap[attNo];

                            return (
                                <div key={pNo ?? idx} style={styles.card} onClick={() => pNo && navigate(`/product/auction/detail/${pNo}`)}
                                     onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)"; }}
                                     onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                                    <div style={styles.imgWrapper}>
                                        <div style={styles.badge}>진행중</div>
                                        {attNo ? (
                                            <img src={src} alt="thumb" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                                                 onError={(e) => { e.target.onerror = null; e.target.src = "/images/no-image.png"; }} />
                                        ) : (
                                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#ccc", fontSize: "12px" }}>이미지 준비중</div>
                                        )}
                                    </div>
                                    <div style={{ padding: "15px", flex: 1, display: "flex", flexDirection: "column" }}>
                                        <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "10px", color: "#333", height: "44px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: "1.4" }}>
                                            {name}
                                        </div>
                                        <div style={{ marginTop: "auto" }}>
                                            <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>현재 입찰가</div>
                                            <div style={styles.priceText}>{money(price)} <span style={{ fontSize: "14px", fontWeight: "normal" }}>원</span></div>
                                            <div style={{ fontSize: "11px", color: "#888", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f5f5f5", textAlign: "right" }}>
                                                마감: {dt(get(p, ["endTime", "end_time"]))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 페이지네이션 */}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "50px", paddingBottom: "50px" }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={styles.paginationBtn(page <= 1)}>이전</button>
                        <span style={{ fontSize: "15px", fontWeight: "bold" }}>{page}</span>
                        <button onClick={() => setPage(p => vo.last ? p : p + 1)} disabled={vo.last} style={styles.paginationBtn(vo.last)}>다음</button>
                    </div>
                </main>
            </div>
        </div>
    );
}