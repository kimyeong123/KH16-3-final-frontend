import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Jumbotron from "./templates/Jumbotron.jsx";

export default function Home() {
    // === [추가] 실제 데이터를 담을 상태 ===
    const [auctionItems, setAuctionItems] = useState([]);
    
    // === [추가] ProductAuctionList에서 가져온 썸네일 로직 상태 ===
    const [thumbNoByProduct, setThumbNoByProduct] = useState({}); 
    const [thumbMap, setThumbMap] = useState({}); 
    const revokeRef = useRef([]);

    // === [추가] 메모리 해제 ===
    useEffect(() => {
        return () => {
            revokeRef.current.forEach((u) => URL.revokeObjectURL(u));
            revokeRef.current = [];
        };
    }, []);

    // === [추가] 1. 마감 임박 데이터 로드 ===
    useEffect(() => {
        const loadAuctionItems = async () => {
            try {
                const resp = await axios.get("http://localhost:8080/product/main/closing-soon");
                setAuctionItems(resp.data || []);
            } catch (err) {
                console.error("경매 목록 로드 실패:", err);
            }
        };
        loadAuctionItems();
    }, []);

    // === [추가] 2. 첨부파일 번호 찾기 (AuctionList 로직) ===
    useEffect(() => {
        if (!auctionItems.length) return;
        const run = async () => {
            const targets = auctionItems
                .filter(p => p.productNo && !thumbNoByProduct[p.productNo])
                .map(p => p.productNo);
            
            if (targets.length === 0) return;

            const res = await Promise.all(targets.map(async (no) => {
                try {
                    const r = await axios.get(`http://localhost:8080/product/${no}/attachments`);
                    return { no, attNo: r.data?.[0]?.attachmentNo }; 
                } catch { return { no, attNo: null }; }
            }));

            const patch = {};
            res.forEach(x => { if(x.attNo) patch[x.no] = x.attNo; });
            setThumbNoByProduct(prev => ({ ...prev, ...patch }));
        };
        run();
    }, [auctionItems]);

    // === [추가] 3. Blob 이미지 로드 (AuctionList 로직) ===
    useEffect(() => {
        const run = async () => {
            const needed = auctionItems
                .map(p => thumbNoByProduct[p.productNo])
                .filter(no => no && !thumbMap[no]);
            
            const uniq = [...new Set(needed)];
            if (uniq.length === 0) return;

            const res = await Promise.all(uniq.map(async (attNo) => {
                try {
                    const r = await axios.get(`http://localhost:8080/attachment/${attNo}`, { responseType: "blob" });
                    const url = URL.createObjectURL(r.data);
                    return { attNo, url };
                } catch { return { attNo, url: null }; }
            }));

            const patch = {};
            res.forEach(x => { 
                if(x.url) { 
                    patch[x.attNo] = x.url; 
                    revokeRef.current.push(x.url); 
                }
            });
            setThumbMap(prev => ({ ...prev, ...patch }));
        };
        run();
    }, [auctionItems, thumbNoByProduct]);

    return (
    <>
        <img src="santa.png" alt="배너이미지" className="img-fluid w-100" style={{ maxHeight: "400px", objectFit: "cover" }} />

        <div className="container mt-4 mt-md-5">

            <section className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="fs-4 fs-md-2">마감 임박 아이템</h3>
                    <Link to="/product/auction/list" className="text-secondary text-decoration-none small">
                        더보기 <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                </div>

                {/* g-2(간격 좁게) 또는 g-3(보통)로 모바일에서의 간격을 조절하세요 */}
                <div className="row g-2 g-md-4">
                    {auctionItems.length > 0 ? (
                        auctionItems.map((item) => {
                            const attNo = thumbNoByProduct[item.productNo];
                            const src = thumbMap[attNo];
                            return (
                                /* 반응형 핵심: 모바일 2개, 태블릿 3개, PC 4개 */
                                <div className="col-6 col-md-4 col-lg-3 mb-3" key={item.productNo}>
                                    <div className="card h-100 shadow-sm border-0">
                                        {/* 이미지 높이 모바일에서 조금 더 낮게 조정 가능 */}
                                        <div style={{ height: "160px", background: "#f8f9fa", position: "relative", overflow: "hidden" }} className="card-img-height">
                                            {src ? (
                                                <img src={src} className="card-img-top" alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"#ccc" }}>No Image</div>
                                            )}
                                        </div>
                                        <div className="card-body d-flex flex-column p-2 p-md-3">
                                            {/* 모바일 가독성을 위해 제목 크기 조절 */}
                                            <h6 className="card-title text-truncate mb-1" title={item.name}>{item.name}</h6>
                                            <p className="card-text text-danger fw-bold mb-2 small-on-mobile" style={{ fontSize: "0.9rem" }}>
                                                {Number(item.currentPrice || item.startPrice).toLocaleString()}원
                                            </p>
                                            <Link to={`/product/auction/detail/${item.productNo}`} className="btn btn-sm btn-outline-primary mt-auto">입찰하기</Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-12 text-center py-5 text-muted">현재 진행 중인 경매 아이템이 없습니다.</div>
                    )}
                </div>
            </section>

        </div>
        
        {/* 모바일 커스텀 스타일 예시 */}
        <style>{`
            @media (max-width: 576px) {
                .card-img-height { height: 140px !important; }
                .small-on-mobile { font-size: 0.8rem !important; }
            }
        `}</style>
    </>
);
}