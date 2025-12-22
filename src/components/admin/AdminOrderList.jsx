import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { Table, Button, Spinner, Badge } from "react-bootstrap";

export default function AdminOrderList() {
  const [accessToken] = useAtom(accessTokenState);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);

  const authHeader = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  const fetchList = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/admin/orders", {
        headers: authHeader,
        params: { page, size: 10 },
      });
      setList(res.data?.list ?? []);
      setPageInfo(res.data ?? null);
    } catch (e) {
      alert("주문 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, accessToken]);

  const completeDelivery = async (orderNo) => {
    if (!window.confirm("배송 완료 처리하시겠습니까?")) return;
    await axios.put(
      `http://localhost:8080/orders/${orderNo}/shipping/delivered`,
      {},
      { headers: authHeader }
    );
    fetchList();
  };

  /* 🔹 상태 뱃지 */
  const statusBadge = (status) => {
    const base = {
      fontSize: 13,
      padding: "6px 14px",
      borderRadius: 999,
      fontWeight: 700,
      color: "#fff",
      display: "inline-block",
      minWidth: 96,
      textAlign: "center",
      letterSpacing: 0.2,
    };

    switch (status) {
      case "CREATED":
        return (
          <span
            style={{
              ...base,
              backgroundColor: "#495057", // 다크 그레이
            }}
          >
            주문 생성
          </span>
        );

      case "SHIPPING_READY":
        return (
          <span
            style={{
              ...base,
              backgroundColor: "#f76707", // 오렌지
            }}
          >
            배송지 입력
          </span>
        );

      case "SHIPPED":
        return (
          <span
            style={{
              ...base,
              backgroundColor: "#1c7ed6", // 블루
            }}
          >
            배송중
          </span>
        );

      case "DELIVERED":
        return (
          <span
            style={{
              ...base,
              backgroundColor: "#2f9e44", // 그린
            }}
          >
            배송 완료
          </span>
        );

      case "COMPLETED":
        return (
          <span
            style={{
              ...base,
              backgroundColor: "#7048e8", // 퍼플
            }}
          >
            정산 완료
          </span>
        );

      case "CANCELLED":
        return (
          <span
            style={{
              ...base,
              backgroundColor: "#e03131", // 레드
            }}
          >
            취소
          </span>
        );

      default:
        return (
          <span
            style={{
              ...base,
              backgroundColor: "#868e96",
            }}
          >
            -
          </span>
        );
    }
  };

  const totalPage = pageInfo?.totalPage ?? 1;

  return (
    <div className="container mt-4">
      {/* 헤더 */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">📦 주문 관리</h3>
        <div className="text-muted" style={{ fontSize: 13 }}>
          <span className="fw-semibold text-info">배송중</span> 상태의 주문만
          배송 완료 처리할 수 있습니다.
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="text-center text-muted py-5">
          처리할 주문이 없습니다.
        </div>
      )}

      {!loading && list.length > 0 && (
        <>
          <Table bordered hover responsive className="align-middle">
            <thead className="table-light">
              <tr className="text-center" style={{ fontSize: 13 }}>
                <th style={{ width: 90 }}>주문번호</th>
                <th style={{ minWidth: 260 }}>상품명</th>
                <th style={{ width: 120 }}>구매자</th>
                <th style={{ width: 120 }}>판매자</th>
                <th style={{ width: 140 }}>주문상태</th>
                <th style={{ width: 140 }}>액션</th>
              </tr>
            </thead>

            <tbody style={{ fontSize: 14 }}>
              {list.map((o) => (
                <tr key={o.orderNo}>
                  <td className="text-center fw-bold text-info">
                    #{o.orderNo}
                  </td>

                  <td
                    style={{
                      maxWidth: 320,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={o.productName}
                  >
                    <span
                      style={{
                        color: "#1b6ec2",
                        fontWeight: 600,
                      }}
                    >
                      {o.productName}
                    </span>
                  </td>

                  {/* 구매자 */}
                  <td className="text-center">
                    <span style={{ color: "#e8590c", fontWeight: 500 }}>
                      {o.buyerNickname}
                    </span>
                  </td>

                  {/* 판매자 */}
                  <td className="text-center">
                    <span style={{ color: "#2f9e44", fontWeight: 500 }}>
                      {o.sellerNickname}
                    </span>
                  </td>

                  <td className="text-center">{statusBadge(o.orderStatus)}</td>

                  <td className="text-center">
                    {o.orderStatus === "SHIPPED" ? (
                      <Button
                        variant="primary"
                        size="sm"
                        className="fw-semibold"
                        onClick={() => completeDelivery(o.orderNo)}
                      >
                        배송 완료
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        className="fw-semibold opacity-50"
                      >
                        처리됨
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* 페이징 */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted" style={{ fontSize: 13 }}>
              페이지 <b>{page}</b> / <b>{totalPage}</b>
              {pageInfo?.dataCount != null && (
                <>
                  {" "}
                  · 총 <b>{pageInfo.dataCount}</b>건
                </>
              )}
            </div>

            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                이전
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={page >= totalPage}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
