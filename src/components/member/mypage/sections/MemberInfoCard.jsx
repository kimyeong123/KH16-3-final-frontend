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
}) {
  return (
    <div className="col-md-7">
      <div className="card shadow-sm p-4 h-100">
        <h4 className="mb-3" style={{ fontWeight: "bold" }}>회원 정보</h4>

        {/* 기본 정보 */}
        <div className="mb-2 mt-2">
          <div className="mb-2"><strong>아이디:</strong> {view?.id}</div>
          <div className="mb-2"><strong>닉네임:</strong> {view?.nickname}</div>
          <div className="mb-2"><strong>권한:</strong> {view?.role}</div>
        </div>

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
          <div className="mb-2 mt-1">
            <strong>가입일:</strong>{" "}
            {view?.createdTime ? new Date(view.createdTime).toLocaleDateString("ko-KR") : "-"}
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
