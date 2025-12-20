import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaEraser } from "react-icons/fa";

export default function MemberInfoCard({


  view,
  isEditing,
  setIsEditing,

  // 이메일 관련
  isViewAs,
  editEmail,
  email,
  emailId,
  setEmailId,
  emailDomain,
  setEmailDomain,
  isEmailCertified,
  setIsEmailCertified,
  sending,
  memberClass,
  certNumberClass,
  certNumber,
  setCertNumber,
  certNumberFeedback,
  sendCertEmail,
  sendCertCheck,
  checkMemberEmail,
  withdrawFilter,
  setWithdrawFilter,

  // 주소 관련
  editPost,
  editAddress1,
  editAddress2,
  setEditAddress2,
  searchAddress,
  clearAddress,

  // 연락처 관련
  editContact,
  handleContactChange,
  contactError,

  // 기타/취소/저장
  post,
  address1,
  address2,
  contact,
  setEditEmail,
  setEditPost,
  setEditAddress1,
  setEditContact,
  setIsEmailVerified,
  setContactError,
  handleUpdateInfo,
  withdrawList,
  withdrawStatusText,
  withdrawStatusClass,

}) {
  return (
    <div className="col-md-7">
      <div className="card shadow-lg rounded-3 overflow-hidden p-4 h-100">
        <div
          className="text-white rounded-3"
          style={{ backgroundColor: "#2C3E50" }}
        >
          <div className="d-flex flex-column align-items-center justify-content-center py-3">
            <h4 className="mb-1 fw-bold">회원 정보</h4>
            <div className="small opacity-75">
              내 정보 확인 · 수정
            </div>
          </div>
        </div>


        {/* 기본 정보 */}
        <div
          className="d-flex flex-column justify-content-center p-3 rounded mb-3 mt-3"
          style={{
            background: "#f9fafb",
            border: "1px solid #eef1f4"
          }}
        >
          <div className="mb-2 mt-2">
            <div className="mb-2"><strong>아이디:</strong> {view?.id}</div>
            <div className="mb-2"><strong>닉네임:</strong> {view?.nickname}</div>
            <div className="mb-2"><strong>권한:</strong> {view?.role}</div>
          </div>
        </div>

        <div
          className="d-flex flex-column justify-content-center p-3 rounded mb-3"
          style={{
            background: "#f9fafb",
            border: "1px solid #eef1f4"
          }}
        >
          {/* 이메일 */}
          <div className="mb-2 mt-2">
            <strong>이메일:</strong>
            {isEditing ? (
              <div className="d-flex flex-column mt-1">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control flex-grow-1"
                    placeholder="아이디"
                    value={emailId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmailId(value);

                      const fullEmail = `${value.trim()}@${emailDomain.trim()}`;
                      if (fullEmail !== email) setIsEmailCertified(false);

                      checkMemberEmail();
                    }}
                  />
                  <span className="input-group-text">@</span>
                  <input
                    type="text"
                    className="form-control flex-grow-2"
                    placeholder="도메인"
                    value={emailDomain}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmailDomain(value);

                      const fullEmail = `${emailId.trim()}@${value.trim()}`;
                      if (fullEmail !== email) setIsEmailCertified(false);

                      checkMemberEmail();
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={sendCertEmail}
                    disabled={sending === true || memberClass?.email === "is-invalid"}
                  >
                    {sending === true ? "발송중..." : "인증번호 전송"}
                  </button>
                </div>

                {(sending === false || isEmailCertified) && (
                  <>
                    <div className="d-flex justify-content-center gap-2 mt-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        className={`form-control w-auto ${certNumberClass}`}
                        placeholder="인증번호 입력"
                        value={certNumber}
                        onChange={(e) => setCertNumber(e.target.value)}
                        disabled={isEmailCertified}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={sendCertCheck}
                        disabled={isEmailCertified}
                      >
                        인증번호 확인
                      </button>
                    </div>

                    {certNumberClass === "is-valid" && (
                      <div className="valid-feedback d-block mt-2">
                        인증번호 확인이 완료되었습니다.
                      </div>
                    )}

                    {certNumberClass === "is-invalid" && certNumberFeedback && (
                      <div className="invalid-feedback d-block mt-2">
                        {certNumberFeedback}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <span className="ms-2">{isViewAs ? view?.email : editEmail}</span>
            )}
          </div>

          {/* 주소 */}
          <div className="mb-2 mt-2">
            <div className="mb-2">
              <strong>우편번호:</strong>
              {isEditing ? (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-2 w-100">
                  <input
                    type="text"
                    className="form-control form-control-sm w-25"
                    value={editPost}
                    readOnly
                  />
                  <button className="btn btn-primary btn-sm" onClick={searchAddress}>
                    <FaMagnifyingGlass />
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={clearAddress}>
                    <FaEraser />
                  </button>
                </div>
              ) : (
                <span className="ms-2">{view?.post}</span>
              )}
            </div>

            <div className="mb-2">
              <strong>기본 주소:</strong>
              {isEditing ? (
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <input type="text" className="form-control mt-1" value={editAddress1} readOnly />
                </div>
              ) : (
                <span className="ms-2">{view?.address1}</span>
              )}
            </div>

            <div className="mb-2">
              <strong>상세 주소:</strong>
              {isEditing ? (
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <input
                    type="text"
                    className="form-control mt-1"
                    value={editAddress2}
                    onChange={(e) => setEditAddress2(e.target.value)}
                  />
                </div>
              ) : (
                <span className="ms-2">{view?.address2}</span>
              )}
            </div>
          </div>

          {/* 연락처 */}
          <div className="mb-2 mt-2">
            <div className="mb-2">
              <strong>연락처:</strong>
              {isEditing ? (
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <input
                    type="text"
                    className={`form-control mt-1 ${contactError ? "is-invalid" : ""}`}
                    value={editContact}
                    onChange={(e) => handleContactChange(e.target.value)}
                  />
                </div>
              ) : (
                <span className="ms-2">{view?.contact}</span>
              )}
              {contactError && <div className="invalid-feedback">{contactError}</div>}
            </div>
          </div>

          {/* 기타 정보 */}
          <div className="mb-2 mt-2">
            <div className="mb-2"><strong>보유 포인트:</strong> {view?.point}p</div>
            <div
              className="d-flex align-items-center justify-content-between px-3 py-3 mb-2 rounded"
              style={{ background: "#f9fafb", border: "1px dashed #dee2e6" }}
            >
              <div className="info-text">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span
                    className="badge bg-primary"
                    style={{ cursor: "pointer" }}
                    data-bs-toggle="modal"
                    data-bs-target="#withdrawModal"
                  >
                    출금 신청
                  </span>
                </div>

                <div className="text-secondary small">
                  보유 포인트를 계좌로 출금 신청할 수 있어요
                </div>
                <button
                  type="button"
                  className="btn btn-link p-0 mt-1 text-muted small"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#withdrawOffcanvas"
                  aria-controls="withdrawOffcanvas"
                >
                  최근 출금 신청 내역 보기
                </button>
              </div>
            </div>
            <div
              className="offcanvas offcanvas-start"
              tabIndex="-1"
              id="withdrawOffcanvas"
              aria-labelledby="withdrawOffcanvasLabel"
              style={{ width: "680px" }}
            >
              <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="withdrawOffcanvasLabel">
                  출금 신청 내역
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                />
              </div>

              <div className="offcanvas-body p-0 d-flex flex-column">
                <div className="px-3 py-2 border-bottom d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className={`btn btn-sm ${withdrawFilter === "ALL" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setWithdrawFilter("ALL")}
                  >
                    전체
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${withdrawFilter === "REQUEST" ? "btn-warning" : "btn-outline-warning"}`}
                    onClick={() => setWithdrawFilter("REQUEST")}
                  >
                    요청
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${withdrawFilter === "APPROVED" ? "btn-success" : "btn-outline-success"}`}
                    style={{
                      padding: "0.25rem 0.5rem",
                      boxShadow: "none",
                      transform: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "none";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "none";
                    }}
                    onClick={() => setWithdrawFilter("APPROVED")}
                  >
                    승인
                  </button>


                  <button
                    type="button"
                    className={`btn btn-sm ${withdrawFilter === "REJECTED" ? "btn-danger" : "btn-outline-danger"}`}
                    onClick={() => setWithdrawFilter("REJECTED")}
                  >
                    거절
                  </button>
                </div>

                {(withdrawList?.length ?? 0) === 0 ? (
                  <div className="text-muted p-3">출금 신청 내역이 없습니다.</div>
                ) : (
                  <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 170px)" }}>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0 text-nowrap">
                        <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                          <tr>
                            <th>신청일</th>
                            <th>금액</th>
                            <th>은행</th>
                            <th>계좌번호</th>
                            <th>상태</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...(withdrawList ?? [])]
                            .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
                            .filter((w) => {
                              const s = String(w.status ?? "").toUpperCase();
                              if (withdrawFilter === "ALL") return true;
                              return s === withdrawFilter;
                            })
                            .map((w) => (
                              <tr key={w.withdrawNo}>
                                <td>
                                  {w.createdTime
                                    ? new Date(w.createdTime).toLocaleString("ko-KR", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })
                                    : "-"}
                                </td>
                                <td className="text-danger fw-semibold">
                                  {Number(w.amount ?? 0).toLocaleString()}원
                                </td>
                                <td>{w.bankName}</td>
                                <td>{w.accountNumber}</td>
                                <td>
                                  <span className={withdrawStatusClass?.(w.status)}>
                                    {withdrawStatusText?.(w.status)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-top d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  data-bs-dismiss="offcanvas"
                >
                  닫기
                </button>
              </div>
            </div>


            <div className="mb-2 mt-1">
              <strong>가입일:</strong>{" "}
              {view?.createdTime ? new Date(view.createdTime).toLocaleDateString("ko-KR") : "-"}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="d-flex justify-content-end gap-2 mt-2">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setIsEditing(false);
                setEditEmail(email);
                setEditPost(post);
                setEditAddress1(address1);
                setEditAddress2(address2);
                setEditContact(contact);
                setIsEmailVerified(false);
                setContactError("");
              }}
            >
              취소
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleUpdateInfo}>
              저장
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
