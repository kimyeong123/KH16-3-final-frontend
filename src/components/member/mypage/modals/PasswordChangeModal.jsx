export default function PasswordChangeModal({
  isOpen,
  onClose,
  currentPassword,
  setCurrentPassword,
  newPassword,
  newPasswordConfirm,
  newPasswordValid,
  confirmValid,
  isSameAsCurrent,
  handleNewPasswordChange,
  handleConfirmChange,
  handlePasswordChange,
  setNewPassword,
  setNewPasswordConfirm
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* backdrop */}
      <div className="modal-backdrop-custom" onClick={onClose} />

      <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered password-modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title block-title">비밀번호 변경</h5>
            </div>

            <div className="modal-body text-center">
              {/* 현재 비밀번호 */}
              <div className="mb-3">
                <label className="form-label fw-bold">현재 비밀번호</label>
                <input
                  type="password"
                  className="form-control mx-auto"
                  style={{ maxWidth: "250px" }}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <hr className="my-4" />

              {/* 새 비밀번호 */}
              <div className="mb-3">
                <label className="form-label fw-bold">새 비밀번호</label>
                <input
                  type="password"
                  className={`form-control mx-auto ${
                    newPasswordValid === false ? "is-invalid" :
                    newPasswordValid === true ? "is-valid" : ""
                  }`}
                  style={{ maxWidth: "250px" }}
                  value={newPassword}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                />

                {isSameAsCurrent && (
                  <div className="invalid-feedback mx-auto">
                    새 비밀번호는 현재 비밀번호와 달라야 합니다.
                  </div>
                )}
                {newPasswordValid === false && (
                  <div className="invalid-feedback mx-auto">
                    8~16자, 대/소문자·숫자·특수문자(!@#$) 포함
                  </div>
                )}
                {newPasswordValid === true && (
                  <div className="valid-feedback mx-auto">올바른 형식입니다.</div>
                )}
              </div>

              {/* 새 비밀번호 확인 */}
              <div className="mb-3">
                <label className="form-label fw-bold text-red">새 비밀번호 확인</label>
                <input
                  type="password"
                  className={`form-control mx-auto ${
                    confirmValid === false ? "is-invalid" :
                    confirmValid === true ? "is-valid" : ""
                  }`}
                  style={{ maxWidth: "250px" }}
                  value={newPasswordConfirm}
                  onChange={(e) => handleConfirmChange(e.target.value)}
                />

                {confirmValid === false && (
                  <div className="invalid-feedback mx-auto">
                    비밀번호가 일치하지 않습니다.
                  </div>
                )}
                {confirmValid === true && (
                  <div className="valid-feedback mx-auto">
                    비밀번호가 일치합니다.
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  setCurrentPassword("");
                  setNewPassword("");
                  setNewPasswordConfirm("");
                }}
              >
                취소
              </button>
              <button className="btn btn-primary" onClick={handlePasswordChange}>
                변경
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
