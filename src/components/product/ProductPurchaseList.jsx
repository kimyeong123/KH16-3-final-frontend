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

    // 인증 헤더 (accessToken이 변경될 때만 재계산)
    const authHeader = useMemo(() => {
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    }, [accessToken]);

    // 데이터 로딩
    useEffect(() => {
        if (!accessToken) return; // 로그인 안 했으면 로드 안 함
        
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

    // 포맷 함수: 금액 (3자리 콤마)
    const money = (val) => {
        if (val === null || val === undefined) return "-";
        return Number(val).toLocaleString();
    };

    // 포맷 함수: 날짜 (월.일 시:분)
    const dt = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        // 날짜 변환 실패 시 원본 반환 혹은 에러 처리
        if (isNaN(d.getTime())) return "-"; 
        
        return `${d.getMonth() + 1}.${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    // 버튼 클릭 핸들러 (배송지 설정 - 알림만 표시)
    const handlePayClick = (productNo) => {
        alert("배송지 설정 버튼입니다. (기능 준비 중)");
    };

    // === 스타일 정의 (Inline Style) ===
    const styles = {
        container: { padding: "30px 0" },
        headerParams: { marginBottom: "20px" },
        title: { fontSize: "24px", fontWeight: "bold", margin: 0 },
        tableBox: { border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", background: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
        table: { width: "100%", borderCollapse: "collapse" },
        thead: { background: "#f8f9fa", borderBottom: "2px solid #eee" },
        th: { padding: "15px", color: "#495057", fontWeight: "600", fontSize: "14px", textAlign: "center" },
        tr: { borderBottom: "1px solid #f0f0f0" },
        td: { padding: "15px", verticalAlign: "middle", textAlign: "center", fontSize: "14px", color: "#333" },
        img: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid #eee", backgroundColor: "#f1f1f1" },
        
        // 버튼/배지
        btnCommon: { padding: "6px 14px", fontSize: "13px", borderRadius: "4px", cursor: "pointer", fontWeight: "600", border: "1px solid transparent", transition: "0.2s" },
        btnRebid: { backgroundColor: "white", border: "1px solid #e03131", color: "#e03131" },
        btnPay: { backgroundColor: "#343a40", color: "white" },
        btnDisabled: { backgroundColor: "#e9ecef", color: "#adb5bd", cursor: "default" },
        badge: (bg, color) => ({ display: "inline-block", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", backgroundColor: bg, color: color, fontWeight: "bold" })
    };

    return (
        <div className="container" style={styles.container}>
            <div style={styles.headerParams}>
                <h3 style={styles.title}>내 입찰/낙찰 내역</h3>
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
                        {/* 로딩 중이 아니고 데이터가 없을 때 */}
                        {!loading && list.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: "60px 0", textAlign: "center", color: "#868e96" }}>
                                    참여한 입찰 내역이 없습니다.
                                </td>
                            </tr>
                        )}

                        {/* 리스트 매핑 */}
                        {list.map((item) => {
                            const isBidding = item.status === 'BIDDING';
                            // COMPLETED, ENDED 등 종료 상태 체크
                            const isEnded = item.status !== 'BIDDING'; 
                            // 내가 선두인지(낙찰자인지) 체크
                            const isLeading = item.myBidPrice >= item.finalPrice;

                            return (
                                <tr key={item.productNo} style={styles.tr}>
                                    {/* 1. 상품 정보 + 썸네일 */}
                                    <td style={{ ...styles.td, textAlign: "left", paddingLeft: "20px", display: "flex", alignItems: "center", gap: "15px" }}>
                                        <img 
                                            src={item.attachmentNo > 0 ? `http://localhost:8080/attachment/${item.attachmentNo}` : "/images/no-image.png"}
                                            alt="상품이미지"
                                            style={styles.img}
                                            onError={(e) => { 
                                                e.target.src = "https://via.placeholder.com/60?text=No+Image"; 
                                            }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: "bold", marginBottom: "4px", cursor: "pointer" }} 
                                                 onClick={() => navigate(`/product/detail/${item.productNo}`)}>
                                                {item.productName}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#888" }}>판매자: {item.sellerNickname}</div>
                                        </div>
                                    </td>

                                    {/* 2. 내 입찰가 */}
                                    <td style={styles.td}>
                                        <span style={{ fontWeight: "bold", color: "#e03131" }}>{money(item.myBidPrice)}</span>원
                                    </td>

                                    {/* 3. 현재가 */}
                                    <td style={styles.td}>
                                        {money(item.finalPrice)}원
                                    </td>

                                    {/* 4. 상태 */}
                                    <td style={styles.td}>
                                        {isBidding && <span style={styles.badge("#e7f5ff", "#1c7ed6")}>진행중</span>}
                                        {isEnded && <span style={styles.badge("#f1f3f5", "#495057")}>종료</span>}
                                    </td>

                                    {/* 5. 마감일시 */}
                                    <td style={{ ...styles.td, fontSize: "13px", color: "#868e96" }}>
                                        {dt(item.endTime)}
                                    </td>

                                    {/* 6. 관리 버튼 */}
                                    <td style={styles.td}>
                                        {/* [A] 진행 중일 때 */}
                                        {isBidding && (
                                            isLeading 
                                            ? <button style={{ ...styles.btnCommon, ...styles.btnDisabled }} disabled>현재 최고가</button>
                                            : <button 
                                                onClick={() => navigate(`/product/auction/detail/${item.productNo}`)} 
                                                style={{ ...styles.btnCommon, ...styles.btnRebid }}
                                              >
                                                재입찰하기
                                              </button>
                                        )}

                                        {/* [B] 종료 되었을 때 */}
                                        {isEnded && (
                                            isLeading 
                                            ? (
                                                // 낙찰 -> 구매확정/배송지 설정
                                                <button 
                                                    onClick={() => handlePayClick(item.productNo)}
                                                    style={{ ...styles.btnCommon, ...styles.btnPay }}
                                                >
                                                    {item.paymentStatus === 'PAID' ? "구매완료" : "배송지설정"}
                                                </button>
                                            ) 
                                            : (
                                                // 패찰
                                                <span style={{ fontSize: "13px", color: "#adb5bd", fontWeight: "bold" }}>패찰 (입찰실패)</span>
                                            )
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}