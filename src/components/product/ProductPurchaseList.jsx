import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";
import OrderShippingModal from "../order/OrderShippingModal";

export default function ProductPurchaseList() {
  const navigate = useNavigate();
  const [accessToken] = useAtom(accessTokenState);

  // ✅ 배송지 모달 상태
  const [showShip, setShowShip] = useState(false);
  const [selected, setSelected] = useState(null);

  // ✅ 목록/로딩
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 페이징
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null); // PageVO 전체 보관

  // ✅ 인증 헤더
  const authHeader = useMemo(() => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  // ✅ 목록 로딩 (page 바뀌면 다시 호출)
  const fetchList = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/product/purchase", {
        headers: authHeader,
        params: { page }, // ✅ 페이징 핵심
      });

      const data = res.data;

      // ✅ 방어: list.map 에러 방지
      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.list)
        ? data.list
        : [];
      setList(rows);
      setPageInfo(Array.isArray(data) ? null : data); // PageVO면 저장
    } catch (err) {
      console.error("구매 내역 로드 실패:", err);
      setList([]);
      setPageInfo(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, authHeader, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ✅ 유틸
  const money = (val) => {
    if (val === null || val === undefined) return "-";
    const n = Number(val);
    if (Number.isNaN(n)) return "-";
    return n.toLocaleString();
  };

  const dt = (dateStr) => {
    if (!dateStr) return "-";
    const s = String(dateStr).trim().replace("T", " ");
    // "YYYY-MM-DD HH:mm:ss" / "YYYY-MM-DD HH:mm" / "YYYY-MM-DD" 대응
    if (s.length >= 19)
      return `${s.slice(0, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)} ${s.slice(
        11,
        13
      )}:${s.slice(14, 16)}:${s.slice(17, 19)}`;
    if (s.length >= 16)
      return `${s.slice(0, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)} ${s.slice(
        11,
        13
      )}:${s.slice(14, 16)}`;
    if (s.length >= 10)
      return `${s.slice(0, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)}`;
    return "-";
  };

  // 낙찰 여부(선두 여부)
  const isLeadingByRow = (item) => {
    const my = Number(item?.myBidPrice ?? -1);
    const fin = Number(item?.finalPrice ?? -1);
    return my >= fin && fin >= 0;
  };

  // ✅ 모달 열기/닫기
  const openShippingModal = (item) => {
    if (!item?.orderNo) {
      alert("orderNo가 없습니다. (purchase list에서 orderNo 내려줘야 함)");
      return;
    }
    setSelected(item);
    setShowShip(true);
  };

  const closeShippingModal = () => {
    setShowShip(false);
    setSelected(null);
  };

  // ===== UI 스타일 (기존 컨셉 유지) =====
  const cardStyle = {
    border: "1px solid #e9ecef",
    borderRadius: 10,
    background: "white",
    overflow: "hidden",
  };

  const badgePill = ({ bg, color, border }) => ({
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: bg,
    color,
    border: border || "1px solid #e9ecef",
    lineHeight: 1.2,
  });

  const btnOutline = (borderColor, color) => ({
    padding: "6px 10px",
    borderRadius: 8,
    border: `1px solid ${borderColor}`,
    background: "white",
    color,
    fontWeight: 800,
    cursor: "pointer",
  });

  const btnSolid = (bg, color = "white") => ({
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid transparent",
    background: bg,
    color,
    fontWeight: 900,
    cursor: "pointer",
  });

  const btnDisabled = {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #dee2e6",
    background: "#f1f3f5",
    color: "#adb5bd",
    fontWeight: 900,
    cursor: "not-allowed",
  };

  // 배지 계산
  const auctionStatusBadge = (isBidding) => {
    return isBidding
      ? badgePill({ bg: "#d3f9d8", color: "#2b8a3e" }) // 진행중
      : badgePill({ bg: "#f1f3f5", color: "#495057" }); // 종료
  };

  const resultBadge = (isBidding, isLeading) => {
    if (isBidding) return badgePill({ bg: "#e7f5ff", color: "#1c7ed6" }); // 경매중
    if (isLeading) return badgePill({ bg: "#fff3bf", color: "#f08c00" }); // 낙찰
    return badgePill({ bg: "#ffe3e3", color: "#c92a2a" }); // 패찰
  };

  const priceLabelStyle = (isBidding) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    marginRight: 8,
    background: isBidding ? "#e7f5ff" : "#f1f3f5",
    color: isBidding ? "#1c7ed6" : "#495057",
    border: "1px solid #e9ecef",
  });

  const priceValueStyle = (isBidding) => ({
    fontWeight: 900,
    color: isBidding ? "#1c7ed6" : "#212529",
  });

  // ✅ PageVO에서 totalPage는 getter라 JSON에 "totalPage"로 내려올 수도 있고,
  // 안 내려오면 dataCount/size로 프론트에서 계산
  const totalPage =
    pageInfo?.totalPage ??
    (pageInfo?.dataCount && pageInfo?.size
      ? Math.floor((pageInfo.dataCount - 1) / pageInfo.size) + 1
      : null);

  const canPrev = page > 1;
  const canNext = totalPage ? page < totalPage : false;

  return (
    <>
      <div style={cardStyle}>
        {/* 헤더 */}
        <div style={{ padding: 18, borderBottom: "1px solid #eef1f4" }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>내 입찰/낙찰 내역</div>
          <div style={{ color: "#6c757d", fontSize: 13 }}>
            경매 상태와 낙찰 결과를 분리해서 보여줍니다. (배송지 입력은 낙찰 시
            활성화)
          </div>
        </div>

        {/* 테이블 */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f8f9fa",
                  borderBottom: "2px solid #eef1f4",
                }}
              >
                <th style={{ padding: 12, textAlign: "left", width: 420 }}>
                  상품
                </th>
                <th style={{ padding: 12, textAlign: "right", width: 140 }}>
                  내 입찰가
                </th>
                <th style={{ padding: 12, textAlign: "right", width: 190 }}>
                  현재가/낙찰가
                </th>
                <th style={{ padding: 12, textAlign: "center", width: 120 }}>
                  경매상태
                </th>
                <th style={{ padding: 12, textAlign: "center", width: 120 }}>
                  낙찰결과
                </th>
                <th style={{ padding: 12, textAlign: "center", width: 190 }}>
                  마감일시
                </th>
                <th style={{ padding: 12, textAlign: "center", width: 220 }}>
                  액션
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: "#6c757d",
                    }}
                  >
                    불러오는 중...
                  </td>
                </tr>
              )}

              {!loading && list.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 60,
                      textAlign: "center",
                      color: "#868e96",
                    }}
                  >
                    참여한 입찰 내역이 없습니다.
                  </td>
                </tr>
              )}

              {!loading &&
                list.map((item) => {
                  const isBidding = item.status === "BIDDING";
                  const isEnded = !isBidding;
                  const isLeading = isLeadingByRow(item);

                  // ✅ 백엔드에서 내려주는 플래그
                  const shippingDone = Boolean(item.shippingCompleted);

                  return (
                    <tr
                      key={item.productNo}
                      style={{ borderBottom: "1px solid #f1f3f5" }}
                    >
                      {/* 상품정보 */}
                      <td style={{ padding: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 14,
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={
                              item.attachmentNo > 0
                                ? `http://localhost:8080/attachment/${item.attachmentNo}`
                                : ""
                            }
                            alt="상품이미지"
                            style={{
                              width: 64,
                              height: 64,
                              objectFit: "cover",
                              borderRadius: 10,
                              border: "1px solid #e9ecef",
                              background: "#f1f3f5",
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />

                          <div style={{ minWidth: 0 }}>
                            <div
                              onClick={() =>
                                navigate(`/product/detail/${item.productNo}`)
                              }
                              style={{
                                fontWeight: 900,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 320,
                              }}
                            >
                              {item.productName}
                            </div>
                            <div style={{ fontSize: 12, color: "#6c757d" }}>
                              판매자: {item.sellerNickname}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 내 입찰가 */}
                      <td style={{ padding: 12, textAlign: "right" }}>
                        <span style={{ fontWeight: 900, color: "#e03131" }}>
                          {money(item.myBidPrice)}
                        </span>
                        원
                      </td>

                      {/* 현재가/낙찰가 */}
                      <td style={{ padding: 12, textAlign: "right" }}>
                        <span style={priceLabelStyle(isBidding)}>
                          {isBidding ? "현재가" : "낙찰가"}
                        </span>
                        <span style={priceValueStyle(isBidding)}>
                          {money(item.finalPrice)}원
                        </span>
                      </td>

                      {/* 경매상태 */}
                      <td style={{ padding: 12, textAlign: "center" }}>
                        <span style={auctionStatusBadge(isBidding)}>
                          {isBidding ? "진행중" : "종료"}
                        </span>
                      </td>

                      {/* 낙찰결과 */}
                      <td style={{ padding: 12, textAlign: "center" }}>
                        <span style={resultBadge(isBidding, isLeading)}>
                          {isBidding ? "진행중" : isLeading ? "낙찰" : "패찰"}
                        </span>
                      </td>

                      {/* 마감일시 */}
                      <td
                        style={{
                          padding: 12,
                          textAlign: "center",
                          color: "#6c757d",
                          fontSize: 13,
                        }}
                      >
                        {dt(item.endTime)}
                      </td>

                      {/* 액션 */}
                      <td style={{ padding: 12, textAlign: "center" }}>
                        {/* 진행중: 재입찰/최고가 */}
                        {isBidding &&
                          (isLeading ? (
                            <button style={btnDisabled} disabled>
                              현재 최고가
                            </button>
                          ) : (
                            <button
                              style={btnOutline("#e03131", "#e03131")}
                              onClick={() =>
                                navigate(
                                  `/product/auction/detail/${item.productNo}`
                                )
                              }
                            >
                              재입찰하기
                            </button>
                          ))}

                        {/* 종료 + 낙찰: 배송지 설정/입력완료 */}
                        {isEnded &&
                          isLeading &&
                          (shippingDone ? (
                            <button style={btnDisabled} disabled>
                              배송지 입력완료
                            </button>
                          ) : (
                            <button
                              style={btnSolid("#212529")}
                              onClick={() => openShippingModal(item)}
                            >
                              배송지설정
                            </button>
                          ))}

                        {/* 종료 + 패찰 */}
                        {isEnded && !isLeading && (
                          <span
                            style={{
                              fontSize: 13,
                              color: "#adb5bd",
                              fontWeight: 900,
                            }}
                          >
                            배송 대상 아님
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* ✅ 페이징 바 (PageVO 기반) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 14,
            borderTop: "1px solid #eef1f4",
            background: "white",
          }}
        >
          <div style={{ color: "#6c757d", fontSize: 13 }}>
            {pageInfo ? (
              <>
                페이지 <b>{page}</b>
                {totalPage ? (
                  <>
                    {" "}
                    / <b>{totalPage}</b>
                  </>
                ) : null}
                {pageInfo?.dataCount !== null &&
                pageInfo?.dataCount !== undefined ? (
                  <>
                    {" "}
                    · 총 <b>{pageInfo.dataCount}</b>건
                  </>
                ) : null}
              </>
            ) : (
              <>
                페이지 <b>{page}</b>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={canPrev ? btnOutline("#495057", "#495057") : btnDisabled}
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← 이전
            </button>

            <button
              style={canNext ? btnOutline("#495057", "#495057") : btnDisabled}
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
            >
              다음 →
            </button>
          </div>
        </div>
      </div>

      {/* ✅ 배송지 모달 */}
      <OrderShippingModal
        show={showShip}
        onHide={closeShippingModal}
        authHeader={authHeader}
        orderNo={selected?.orderNo}
        defaultValue={{
          orderNo: selected?.orderNo ?? null,
          receiverName: "",
          receiverPhone: "",
          post: "",
          address1: "",
          address2: "",
        }}
        onSaved={() => {
          closeShippingModal();
          fetchList(); // ✅ 저장 후 현재 페이지 새로고침
        }}
      />
    </>
  );
}
