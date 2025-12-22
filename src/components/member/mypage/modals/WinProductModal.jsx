import { Link } from "react-router-dom";

export default function WinProductModal({ winProduct = [] }) {
    return (
        <div
            className="modal fade"
            id="winProductModal"
            tabIndex="-1"
            aria-hidden="true"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
        >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md">
                <div className="modal-content">
                    <div className="modal-header d-flex align-items-center">
                        <h5 className="modal-title fw-bold mb-0">낙찰 내역</h5>
                    </div>

                    <div className="modal-body">
                        {winProduct.length === 0 ? (
                            <div className="text-center text-muted py-4">낙찰 내역이 없습니다</div>
                        ) : (
                            <div className="d-grid gap-2">
                                {winProduct.map((p) => (
                                    <div
                                        key={p.productNo}
                                        className="p-3 rounded"
                                        style={{ background: "#f9fafb", border: "1px solid #e9ecef" }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="me-2">
                                                <div className="mt-2 d-flex align-items-center gap-2">
                                                    <span className="text-muted small">상품명</span>
                                                    <span className="text-muted">:</span>

                                                    <Link
                                                        to={`/product/auction/detail/${p.productNo}`}
                                                        className="text-decoration-none fw-semibold"
                                                        style={{
                                                            color: "#2c3e50",
                                                            letterSpacing: "-0.2px"
                                                        }}
                                                    >
                                                        {p.productName}
                                                    </Link>
                                                </div>

                                                <div className="mt-2 d-flex align-items-center gap-2 small text-muted">
                                                    <span>종료 시각</span>
                                                    <span>:</span>
                                                    <span>
                                                        {p.endTime ? new Date(p.endTime).toLocaleString("ko-KR") : "-"}
                                                    </span>
                                                </div>

                                            </div>

                                            <div className="text-end">
                                                <div className="text-muted small text-secondary">낙찰가</div>
                                                <div className="fw-bold fs-5">
                                                    {Number(p.finalPrice ?? 0).toLocaleString()}원
                                                </div>
                                                <div className="mt-1">
                                                    <span className="badge text-bg-secondary">
                                                        {String(p.status || "").toUpperCase() === "ENDED" ? "낙찰 완료" : p.status}
                                                    </span>
                                                </div>
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
