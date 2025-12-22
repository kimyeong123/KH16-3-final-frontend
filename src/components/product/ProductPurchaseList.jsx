import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";

export default function ProductPurchaseList() {
    const navigate = useNavigate();
    const [accessToken] = useAtom(accessTokenState);

    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    // === [추가] 필터 및 페이지네이션 상태 ===
    const [activeSubTab, setActiveSubTab] = useState("ALL"); // ALL, BIDDING, WIN
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // 10개씩 보기

    const authHeader = useMemo(() => {
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken) return;
        
        setLoading(true);
        axios.get("http://localhost:8080/product/purchase", { headers: authHeader })
            .then(res => {
                setList(res.data || []);
            })
            .catch(err => {
                console.error("구매 내역 로드 실패:", err);
                setList([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [accessToken, authHeader]);

    // === [추가 로직 1] 서브 탭 필터링 ===
    const filteredList = useMemo(() => {
        if (activeSubTab === "BIDDING") {
            // 최근 입찰 중 (진행중인 것만)
            return list.filter(item => item.status === 'BIDDING');
        } else if (activeSubTab === "WIN") {
            // 배송지 설정 (종료되었고 내가 최고가인 것만)
            return list.filter(item => item.status !== 'BIDDING' && item.myBidPrice >= item.finalPrice);
        }
        return list; // 전체
    }, [list, activeSubTab]);

    // === [추가 로직 2] 페이지네이션 (10개씩 자르기) ===
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredList.slice(start, start + itemsPerPage);
    }, [filteredList, currentPage]);

    // 탭 변경 시 페이지 1로 초기화
    const handleSubTabChange = (tab) => {
        setActiveSubTab(tab);
        setCurrentPage(1);
    };

    const money = (val) => {
        if (val === null || val === undefined) return "-";
        return Number(val).toLocaleString();
    };

    const dt = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "-"; 
        return `${d.getMonth() + 1}.${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const handlePayClick = (productNo) => {
        alert("배송지 설정 버튼입니다. (기능 준비 중)");
    };

    const styles = {
        container: { padding: "30px 0" },
        headerParams: { marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
        title: { fontSize: "24px", fontWeight: "bold", margin: 0 },
        // [추가] 서브탭 스타일
        subTabBox: { display: "flex", gap: "10px", marginBottom: "20px" },
        subTabBtn: (isActive) => ({
            padding: "8px 16px", borderRadius: "20px", border: "1px solid #ddd",
            background: isActive ? "#333" : "#fff", color: isActive ? "#fff" : "#666",
            fontSize: "13px", fontWeight: "bold", cursor: "pointer", transition: "0.2s"
        }),
        tableBox: { border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", background: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
        table: { width: "100%", borderCollapse: "collapse" },
        thead: { background: "#f8f9fa", borderBottom: "2px solid #eee" },
        th: { padding: "15px", color: "#495057", fontWeight: "600", fontSize: "14px", textAlign: "center" },
        tr: { borderBottom: "1px solid #f0f0f0" },
        td: { padding: "15px", verticalAlign: "middle", textAlign: "center", fontSize: "14px", color: "#333" },
        img: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid #eee", backgroundColor: "#f1f1f1" },
        btnCommon: { padding: "6px 14px", fontSize: "13px", borderRadius: "4px", cursor: "pointer", fontWeight: "600", border: "1px solid transparent", transition: "0.2s" },
        btnRebid: { backgroundColor: "white", border: "1px solid #e03131", color: "#e03131" },
        btnPay: { backgroundColor: "#343a40", color: "white" },
        btnDisabled: { backgroundColor: "#e9ecef", color: "#adb5bd", cursor: "default" },
        badge: (bg, color) => ({ display: "inline-block", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", backgroundColor: bg, color: color, fontWeight: "bold" }),
        // [추가] 페이지네이션 스타일
        pagination: { display: "flex", justifyContent: "center", gap: "5px", marginTop: "30px" },
        pageBtn: (isActive) => ({
            minWidth: "35px", height: "35px", padding: "0 10px", border: "1px solid #ddd", borderRadius: "4px",
            background: isActive ? "#333" : "#fff", color: isActive ? "#fff" : "#333", cursor: "pointer"
        })
    };

    return (
        <div className="container" style={styles.container}>
            <div style={styles.headerParams}>
                <h3 style={styles.title}>내 입찰/낙찰 내역</h3>
                <span style={{fontSize: "13px", color: "#999"}}>총 {filteredList.length}건</span>
            </div>

            {/* === [신규] 서브 탭 필터 영역 === */}
            <div style={styles.subTabBox}>
                <button style={styles.subTabBtn(activeSubTab === "ALL")} onClick={() => handleSubTabChange("ALL")}>전체 내역</button>
                <button style={styles.subTabBtn(activeSubTab === "BIDDING")} onClick={() => handleSubTabChange("BIDDING")}>최근 입찰 중</button>
                <button style={styles.subTabBtn(activeSubTab === "WIN")} onClick={() => handleSubTabChange("WIN")}>배송지 설정 (낙찰)</button>
            </div>

            <div style={styles.tableBox}>
                <table style={styles.table}>
                    <thead style={styles.thead}>
                        <tr>
                            <th style={{ ...styles.th, textAlign: "left", paddingLeft: "20px" }}>상품정보</th>
                            <th style={styles.th}>내 입찰가</th>
                            <th style={styles.th}>현재가 (낙찰가)</th>
                            <th style={styles.th}>상태</th>
                            <th style={styles.th}>마감일시</th>
                            <th style={styles.th}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && filteredList.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: "60px 0", textAlign: "center", color: "#868e96" }}>
                                    참여한 입찰 내역이 없습니다.
                                </td>
                            </tr>
                        )}

                        {/* === [수정] list 대신 페이지네이션이 적용된 currentItems를 매핑 === */}
                        {currentItems.map((item) => {
                            const isBidding = item.status === 'BIDDING';
                            const isEnded = item.status !== 'BIDDING'; 
                            const isLeading = item.myBidPrice >= item.finalPrice;

                            return (
                                <tr key={item.productNo} style={styles.tr}>
                                    <td style={{ ...styles.td, textAlign: "left", paddingLeft: "20px", display: "flex", alignItems: "center", gap: "15px" }}>
                                        <img 
                                            src={item.attachmentNo > 0 ? `http://localhost:8080/attachment/${item.attachmentNo}` : "/images/no-image.png"}
                                            alt="상품이미지"
                                            style={styles.img}
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/60?text=No+Image"; }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: "bold", marginBottom: "4px", cursor: "pointer" }} 
                                                 onClick={() => navigate(`/product/detail/${item.productNo}`)}>
                                                {item.productName}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#888" }}>판매자: {item.sellerNickname}</div>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ fontWeight: "bold", color: "#e03131" }}>{money(item.myBidPrice)}</span>원
                                    </td>
                                    <td style={styles.td}>{money(item.finalPrice)}원</td>
                                    <td style={styles.td}>
                                        {isBidding && <span style={styles.badge("#e7f5ff", "#1c7ed6")}>진행중</span>}
                                        {isEnded && <span style={styles.badge("#f1f3f5", "#495057")}>종료</span>}
                                    </td>
                                    <td style={{ ...styles.td, fontSize: "13px", color: "#868e96" }}>{dt(item.endTime)}</td>
                                    <td style={styles.td}>
                                        {isBidding && (
                                            isLeading 
                                            ? <button style={{ ...styles.btnCommon, ...styles.btnDisabled }} disabled>현재 최고가</button>
                                            : <button onClick={() => navigate(`/product/auction/detail/${item.productNo}`)} style={{ ...styles.btnCommon, ...styles.btnRebid }}>재입찰하기</button>
                                        )}
                                        {isEnded && (
                                            isLeading 
                                            ? <button onClick={() => handlePayClick(item.productNo)} style={{ ...styles.btnCommon, ...styles.btnPay }}>
                                                {item.paymentStatus === 'PAID' ? "구매완료" : "배송지설정"}
                                              </button> 
                                            : <span style={{ fontSize: "13px", color: "#adb5bd", fontWeight: "bold" }}>패찰 (입찰실패)</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* === [신규] 페이지네이션 UI === */}
            {totalPages > 1 && (
                <div style={styles.pagination}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button 
                            key={pageNum} 
                            style={styles.pageBtn(currentPage === pageNum)}
                            onClick={() => setCurrentPage(pageNum)}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}