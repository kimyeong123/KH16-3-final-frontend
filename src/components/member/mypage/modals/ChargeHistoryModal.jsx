export default function ChargeHistoryModal({ chargeHistory }) {
  const list = (chargeHistory ?? []).slice(0, 10);
  const total = list.reduce((sum, h) => sum + Number(h?.amount ?? 0), 0);

  return (
    <div className="modal fade" id="chargeHistoryModal" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static"
  data-bs-keyboard="false">
      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md"
        style={{ maxWidth: "400px" }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">충전 내역</h5>
          </div>

          <div className="modal-body">
            <div className="bg-light border rounded p-3">
              <div className="text-center fw-bold fs-4">BIDHOUSE</div>
              <div className="text-center fw-bold fs-6">POINT RECEIPT</div>
              <div className="my-2" style={{ borderTop: "1px dashed #999" }} />

              {list.length === 0 ? (
                <div className="text-center text-muted py-4 small">
                  최근 충전한 내역이 없습니다.
                </div>
              ) : (
                <>
                  <div className="small text-muted d-flex justify-content-between">
                    <span className="fw-bold">날짜</span>
                    <span className="fw-bold">금액</span>
                  </div>

                  <div className="mt-2">
                    {list.map((h) => (
                      <div
                        key={h.pointHistoryNo}
                        className="d-flex justify-content-between align-items-start mb-2"
                      >
                        <div className="me-2">
                          {h.createdTime ? new Date(h.createdTime).toLocaleDateString("ko-KR") : "-"}
                        </div>
                        <div className="fw-bold">+{Number(h.amount ?? 0).toLocaleString()}P</div>
                      </div>
                    ))}
                  </div>

                  <div className="my-2" style={{ borderTop: "1px dashed #999" }} />

                  <div className="d-flex justify-content-between fw-bold">
                    <span>TOTAL</span>
                    <span>+{total.toLocaleString()}P</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-muted small mt-2">
              * 최근 10건만 표시됩니다
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={(e) => {
                e.currentTarget.blur();
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
