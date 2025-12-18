import { Link } from "react-router-dom";

export default function BidHistoryModal({
  bidHistory = [],
  onlyBidding,
  setOnlyBidding,
  filtered = []
}) {
  
  return (
    <div className="modal fade" id="bidHistoryModal" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static"
  data-bs-keyboard="false">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md">
        <div className="modal-content">
          <div className="modal-header d-flex align-items-center">
            <h5 className="modal-title fw-bold mb-0">입찰 내역</h5>

            <div className="ms-auto d-flex align-items-center">
              <div className="form-check mb-0 me-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="onlyBidding"
                  checked={onlyBidding}
                  onChange={(e) => setOnlyBidding(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="onlyBidding">
                  경매 진행 중인 상품
                </label>
              </div>
            </div>
          </div>

          <div className="modal-body">
            {bidHistory.length === 0 ? (
              <div className="text-center text-muted py-4">입찰 내역이 없습니다</div>
            ) : (
              <div className="d-grid gap-2">
                {filtered.map((b) => (
                  <div
                    key={b.productNo}
                    className="p-3 rounded"
                    style={{ background: "#f9fafb", border: "1px solid #e9ecef" }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="me-2">
                        <div className="fw-bold">
                          <Link
                            to={`/product/auction/detail/${b.productNo}`}
                            className="text-decoration-none text-primary"
                          >
                            {b.productName}
                          </Link>
                        </div>
                        <div className="text-muted small mt-1">
                          마지막 입찰:{" "}
                          {b.lastBidTime ? new Date(b.lastBidTime).toLocaleString("ko-KR") : "-"}
                        </div>
                      </div>

                      <div className="text-end">
                        <div className="fw-bold fs-5 text-red">
                          {Number(b.lastBidAmount ?? 0).toLocaleString()}원
                        </div>
                        <div className="text-muted small text-secondary">나의 최종 입찰가</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={(e) => e.currentTarget.blur()}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
