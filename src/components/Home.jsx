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

            <div className="container mt-5">

                {/* 추천 경매 아이템 (실제 데이터 연동) */}
                <section className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>마감 임박 아이템</h3>
                        <Link to="/product/auction/list" className="text-secondary text-decoration-none">
                            더보기 <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>
                    <div className="row">
                        {auctionItems.length > 0 ? (
                            auctionItems.map((item) => {
                                const attNo = thumbNoByProduct[item.productNo];
                                const src = thumbMap[attNo];
                                return (
                                    <div className="col-md-3 mb-3" key={item.productNo}>
                                        <div className="card h-100 shadow-sm">
                                            {/* AuctionList 스타일의 이미지 렌더링 */}
                                            <div style={{ height: "200px", background: "#f8f9fa", position: "relative", overflow: "hidden" }}>
                                                {src ? (
                                                    <img src={src} className="card-img-top" alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"#ccc" }}>No Image</div>
                                                )}
                                            </div>
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title text-truncate">{item.name}</h5>
                                                <p className="card-text text-danger fw-bold">
                                                    현재가: {Number(item.currentPrice || item.startPrice).toLocaleString()} 원
                                                </p>
                                                <Link to={`/product/auction/detail/${item.productNo}`} className="btn btn-outline-primary mt-auto">입찰하기</Link>
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
        </>
    );
}