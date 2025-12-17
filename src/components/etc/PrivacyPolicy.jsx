import { useEffect, useMemo, useState } from "react";

/**
 * 경매 서비스용 개인정보 처리방침 (Terms.jsx와 동일한 UI/UX)
 * - 프로젝트/시연용 문구
 * - 실제 운영 시 법무 검토 권장
 */
export default function PrivacyPolicy() {
  const [page, setPage] = useState(0);

  const pages = useMemo(
    () => [
      {
        title: "개인정보 처리방침 (경매 서비스)",
        content: (
          <>
            <p className="mb-2">
              본 개인정보 처리방침은 회사가 제공하는 경매 서비스 이용 과정에서
              개인정보를 어떤 항목으로 수집하고, 어떤 목적으로 이용하며, 어떻게 보관·파기하는지,
              이용자가 어떤 권리를 행사할 수 있는지 안내합니다.
            </p>

            <div className="alert alert-light border mt-3 mb-0">
              <div className="fw-semibold mb-1">요약</div>
              <ul className="mb-0">
                <li>최소한의 개인정보만 수집하고, 목적 외 이용을 제한합니다.</li>
                <li>경매(입찰/낙찰), 결제/포인트, 배송, 분쟁 처리에 필요한 범위에서 이용합니다.</li>
                <li>법령에 따라 필요한 기간만 보관 후 안전하게 파기합니다.</li>
              </ul>
            </div>
          </>
        ),
      },
      {
        title: "제 1 조 (수집하는 개인정보 항목)",
        content: (
          <>
            <p className="mb-2">
              회사는 서비스 제공을 위해 아래 정보를 수집할 수 있습니다.
            </p>

            <ul>
              <li>
                <b>회원가입(필수)</b>: 아이디, 비밀번호(암호화 저장), 이메일, 닉네임
              </li>
              <li>
                <b>회원가입(선택)</b>: 연락처, 주소/배송지 정보
              </li>
              <li>
                <b>거래/서비스 이용</b>: 입찰/낙찰/주문/정산 기록, 포인트 충전/사용 이력, 문의/신고/분쟁 처리 기록
              </li>
              <li>
                <b>자동 수집</b>: 접속 로그, IP 주소, 쿠키, 기기/브라우저 정보(서비스 품질·보안 목적)
              </li>
            </ul>

            <div className="text-muted small mb-0">
              ※ 결제수단(카드/계좌 등) 정보는 결제대행사에서 처리되며, 회사가 저장하지 않는 것을 원칙으로 합니다.
            </div>
          </>
        ),
      },
      {
        title: "제 2 조 (개인정보의 수집 및 이용 목적)",
        content: (
          <>
            <ul className="mb-0">
              <li>회원 식별 및 회원관리(가입, 로그인, 본인확인 등)</li>
              <li>경매 서비스 제공(입찰/낙찰, 거래 진행/완료 처리)</li>
              <li>결제/포인트 충전 및 사용 처리</li>
              <li>배송 및 인도 관련 처리(연락/주소 전달 등)</li>
              <li>부정 이용 방지 및 보안/서비스 안정성 확보</li>
              <li>고객 문의/불만/분쟁 처리 및 공지 안내</li>
            </ul>
          </>
        ),
      },
      {
        title: "제 3 조 (보관 기간 및 파기)",
        content: (
          <>
            <p className="mb-2">
              회사는 개인정보 수집·이용 목적 달성 후 지체 없이 파기합니다.
              다만, 관계 법령에 따라 아래 기록은 일정 기간 보관될 수 있습니다.
            </p>

            <div className="card border-0 bg-light">
              <div className="card-body">
                <ul className="mb-0">
                  <li>계약 또는 청약철회 등에 관한 기록: <b>5년</b></li>
                  <li>대금결제 및 재화 등의 공급에 관한 기록: <b>5년</b></li>
                  <li>소비자의 불만 또는 분쟁처리에 관한 기록: <b>3년</b></li>
                </ul>
              </div>
            </div>

            <div className="alert alert-light border mt-3 mb-0">
              <div className="fw-semibold mb-1">파기 방법</div>
              <ul className="mb-0">
                <li>전자적 파일: 복구 불가능한 방식으로 삭제</li>
                <li>종이 문서: 분쇄 또는 소각</li>
              </ul>
            </div>
          </>
        ),
      },
      {
        title: "제 4 조 (제3자 제공)",
        content: (
          <>
            <p className="mb-2">
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다.
            </p>

            <ul>
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 따라 제공이 요구되는 경우</li>
              <li>
                배송을 위해 필요한 경우: 판매자 또는 배송사에 최소한의 정보(연락처/주소 등) 제공
              </li>
            </ul>

            <div className="text-muted small mb-0">
              ※ 실제 운영 시 “제공받는 자 / 제공 항목 / 제공 목적 / 보유기간”을 표로 명확히 기재하는 것이 좋습니다.
            </div>
          </>
        ),
      },
      {
        title: "제 5 조 (처리 위탁)",
        content: (
          <>
            <p className="mb-2">
              회사는 원활한 서비스 제공을 위해 일부 업무를 외부 업체에 위탁할 수 있습니다.
            </p>

            <ul>
              <li><b>결제 처리</b> : 카카오페이 등 결제대행사</li>
              <li><b>알림 발송</b >: 문자/이메일 발송 대행</li>
              <li><b>인프라 운영</b> : 서버/클라우드 제공 업체(운영 환경에 따라)</li>
            </ul>

            <div className="alert alert-light border mb-0">
              위탁 시 관련 법령에 따라 위탁 계약을 체결하고, 개인정보가 안전하게 관리되도록 감독합니다.
            </div>
          </>
        ),
      },
      {
        title: "제 6 조 (이용자의 권리 및 행사 방법)",
        content: (
          <>
            <ul>
              <li>개인정보 열람/정정/삭제 요청</li>
              <li>처리정지 요청 및 동의 철회(회원탈퇴)</li>
              <li>문의/불만/피해구제 요청</li>
            </ul>

            <div className="text-muted small mb-0">
              ※ 서비스 내 “마이페이지” 또는 고객센터를 통해 요청 가능하도록 설계하는 것을 권장합니다.
            </div>
          </>
        ),
      },
      {
        title: "제 7 조 (안전성 확보 조치)",
        content: (
          <>
            <ul className="mb-0">
              <li>비밀번호 암호화 저장 및 접근 권한 최소화</li>
              <li>접근통제, 로그 관리, 보안 업데이트 및 취약점 대응</li>
              <li>개인정보 취급자 최소화 및 내부 교육</li>
              <li>백업 및 보안 정책 적용</li>
            </ul>
          </>
        ),
      },
      {
        title: "제 8 조 (개인정보 보호 책임자 및 문의)",
        content: (
          <>
            <p className="mb-2">
              개인정보 보호 관련 문의 및 요청은 아래로 접수할 수 있습니다.
            </p>
            <ul className="mb-0">
              <li>담당 부서 : 고객지원팀</li>
              <li>카카오톡 오픈채팅 : https://open.kakao.com/o/siq6ZY6h</li>
              <li>응대 시간 : 평일 09:00 ~ 18:00</li>
            </ul>
          </>
        ),
      },
      {
        title: "제 9 조 (개정 및 고지)",
        content: (
          <>
            <p>
              본 방침은 관련 법령 또는 서비스 정책 변경에 따라 개정될 수 있으며,
              변경 시 서비스 화면을 통해 사전 고지합니다.
            </p>

            <div className="alert alert-light border mb-0">
              <div className="fw-semibold mb-1">마무리</div>
              <div className="text-muted small">
                본 방침은 프로젝트/시연용 예시 문구입니다.
              </div>
            </div>
          </>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const isFirst = page === 0;
  const isLast = page === pages.length - 1;

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(pages.length - 1, p + 1));

  return (
    <div className="container my-5" style={{ maxWidth: 900 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          {/* 헤더 */}
          <div className="text-center mb-3">
            <div className="fw-bold fs-4">개인정보 처리방침</div>
            <div className="text-muted small">
              수집 · 이용 · 제공 · 보관 · 파기 · 권리 안내
            </div>
          </div>

          {/* 진행바 */}
          <div className="progress mb-3" role="progressbar" aria-label="privacy progress">
            <div
              className="progress-bar"
              style={{ width: `${((page + 1) / pages.length) * 100}%` }}
            />
          </div>

          {/* 섹션 타이틀 */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">{pages[page].title}</h5>
            <span className="badge text-bg-light">
              {page + 1} / {pages.length}
            </span>
          </div>

          {/* 본문 카드 */}
          <div className="card border-0 bg-light">
            <div className="card-body" style={{ minHeight: 260 }}>
              {pages[page].content}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-outline-secondary" onClick={goPrev} disabled={isFirst}>
              이전
            </button>

            <div className="d-flex gap-2">
              {/* 목차/점프 */}
              <select
                className="form-select"
                style={{ width: 260 }}
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
              >
                {pages.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {idx + 1}. {p.title}
                  </option>
                ))}
              </select>

              <button className="btn btn-outline-secondary" onClick={goNext} disabled={isLast}>
                다음
              </button>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="text-muted small mt-3">
            ※ 회원가입 시 본 개인정보 처리방침에 동의한 것으로 간주됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}
