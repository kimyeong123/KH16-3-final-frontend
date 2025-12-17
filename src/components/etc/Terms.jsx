import { useEffect, useMemo, useState } from "react";

/**
 * 경매(입찰/낙찰) 서비스용 "홈페이지 이용약관" (카드식 페이지 넘김)
 * - 프로젝트 제출/시연 기준으로 실무스러운 조항을 넉넉히 포함
 * - 실제 상용 서비스는 법무 검토 권장
 */
export default function Terms() {
  const [page, setPage] = useState(0);

  const termsPages = useMemo(
    () => [
      {
        title: "홈페이지 이용약관 (경매 서비스)",
        content: (
          <>
            <p className="mb-2">
              본 약관은 경매(입찰/낙찰) 기반 거래 서비스를 제공하는 <b>회사</b>와 서비스를 이용하는 <b>이용자</b> 간의
              권리·의무 및 책임사항, 서비스 이용조건과 절차를 규정함을 목적으로 합니다.
            </p>
            <div className="alert alert-light border mt-3 mb-0">
              <div className="fw-semibold mb-1">요약</div>
              <ul className="mb-0">
                <li>입찰은 신중히 진행해 주세요. 낙찰 시 구매 의무가 발생할 수 있습니다.</li>
                <li>수수료/정산/취소/분쟁 규정은 본 약관의 해당 조항을 따릅니다.</li>
                <li>금지 품목/불법 거래는 즉시 제한될 수 있습니다.</li>
              </ul>
            </div>
          </>
        ),
      },
      {
        title: "제 1 조 (정의)",
        content: (
          <>
            <ul className="mb-0">
              <li>
                <b>서비스</b>: 회사가 제공하는 웹/앱 기반의 경매, 결제(포인트 포함), 정산, 배송정보 제공, 고객지원 등
                일체의 기능을 말합니다.
              </li>
              <li>
                <b>회원</b>: 회사의 약관에 동의하고 회원가입을 완료하여 서비스를 이용하는 자를 말합니다.
              </li>
              <li>
                <b>판매자</b>: 경매 물품을 등록(출품)하고 낙찰자에게 물품을 판매/인도하는 회원을 말합니다.
              </li>
              <li>
                <b>구매자</b>: 경매 물품에 입찰하고 낙찰 시 대금을 지급하며 물품을 수령하는 회원을 말합니다.
              </li>
              <li>
                <b>입찰</b>: 구매자가 특정 물품에 대해 희망가격을 제시하는 행위를 말합니다.
              </li>
              <li>
                <b>낙찰</b>: 경매 종료 시점에 회사가 정한 기준(최고가 등)에 따라 구매자가 구매자로 확정되는 것을 말합니다.
              </li>
              <li>
                <b>포인트</b>: 서비스 내 결제/수수료/기타 유료기능에 사용할 수 있는 선불성 전자적 가치(잔액)를 말합니다.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: "제 2 조 (약관의 효력 및 변경)",
        content: (
          <>
            <p>
              본 약관은 서비스 화면에 게시하거나 기타 방법으로 공지함으로써 효력이 발생합니다. 회사는 관련 법령을 위반하지 않는 범위에서
              약관을 변경할 수 있으며, 변경 시 적용일자 및 변경사유를 명시하여 사전 공지합니다.
            </p>
            <p className="mb-0">
              회원이 변경 약관 시행 이후에도 서비스를 계속 이용하는 경우, 변경 약관에 동의한 것으로 봅니다. 회원은 변경 약관에 동의하지 않는 경우
              이용계약을 해지할 수 있습니다.
            </p>
          </>
        ),
      },
      {
        title: "제 3 조 (회원가입 및 계정관리)",
        content: (
          <>
            <ul>
              <li>회원가입은 이용자가 약관 및 개인정보 처리방침에 동의하고, 회사가 승낙함으로써 성립합니다.</li>
              <li>회원은 정확한 정보를 제공해야 하며, 허위 정보로 인한 불이익은 회원에게 있습니다.</li>
              <li>계정(ID/비밀번호/토큰 등) 관리 책임은 회원에게 있으며, 제3자 사용이 의심되면 즉시 비밀번호 변경 및 회사에 통지해야 합니다.</li>
              <li>회사는 보안상 필요 시 특정 기능(입찰/출품/정산 등)에 대해 추가 인증을 요구할 수 있습니다.</li>
            </ul>
            <div className="alert alert-warning mb-0">
              <b>주의:</b> 타인의 계정을 무단 사용하거나 거래를 가장하는 행위는 서비스 이용 제한 및 법적 책임이 발생할 수 있습니다.
            </div>
          </>
        ),
      },
      {
        title: "제 4 조 (경매/입찰/낙찰 규칙)",
        content: (
          <>
            <ul>
              <li>경매 물품의 상세정보(상태/구성/하자/배송조건)는 판매자가 작성하며, 판매자는 사실과 다르게 표시할 수 없습니다.</li>
              <li>입찰은 철회가 제한될 수 있으며, 낙찰 시 구매 의무가 발생합니다(단, 법령 또는 회사 정책에서 정한 예외는 제외).</li>
              <li>동일 계정/연결 계정 간의 <b>자전거래</b>, 가격부양을 위한 허위 입찰 등 부정행위는 금지됩니다.</li>
              <li>회사는 시스템 오류/부정행위 의심 등 합리적인 사유가 있는 경우, 해당 경매의 입찰/낙찰을 취소하거나 재진행할 수 있습니다.</li>
              <li>경매 종료 후 낙찰자가 확정되며, 낙찰자에게 결제 안내가 제공됩니다.</li>
            </ul>
            <div className="text-muted small mb-0">
              ※ 예: “최고가 낙찰”, “즉시구매가”, “연장(스나이핑 방지) 규칙” 등은 서비스 정책에 따를 수 있습니다.
            </div>
          </>
        ),
      },
      {
        title: "제 5 조 (결제, 포인트, 수수료)",
        content: (
          <>
            <ul>
              <li>포인트 충전/결제는 회사가 제공하는 결제수단(예: 카카오페이 등)을 통해 진행됩니다.</li>
              <li>포인트는 서비스 내에서만 사용 가능하며, 사용처/사용제한은 서비스 화면에 표시된 정책을 따릅니다.</li>
              <li>낙찰 대금 결제, 서비스 이용 수수료(판매 수수료/중개 수수료/결제 수수료 등)가 발생할 수 있으며, 수수료율 및 부과 기준은 공지된 정책에 따릅니다.</li>
              <li>결제 실패/취소/환불의 상세 처리(포인트 회수 포함)는 결제 정책 및 본 약관의 환불/취소 조항을 따릅니다.</li>
            </ul>
            <div className="alert alert-light border mb-0">
              <div className="fw-semibold mb-1">팁</div>
              <div className="text-muted small">
                실제 서비스에서는 “수수료율”, “정산 주기”, “포인트 유효기간” 같은 정책을 별도 페이지로 두고 링크하는 방식을 많이 씁니다.
              </div>
            </div>
          </>
        ),
      },
      {
        title: "제 6 조 (배송, 인도, 검수, 거래완료)",
        content: (
          <>
            <ul>
              <li>배송 방식(직거래/택배 등), 배송비 부담 주체, 발송 기한은 물품 상세 및 거래 단계 안내에 따릅니다.</li>
              <li>판매자는 낙찰/결제 완료 후 정해진 기한 내 발송해야 하며, 구매자는 수령 후 물품 상태를 확인(검수)해야 합니다.</li>
              <li>구매자가 정해진 기간 내 이의제기 없이 거래 완료 처리되면, 거래는 완료로 간주될 수 있습니다.</li>
              <li>분쟁 발생 시 회사는 원활한 해결을 위해 거래기록, 메시지, 결제기록 등을 확인할 수 있습니다.</li>
            </ul>
            <div className="alert alert-info mb-0">
              <b>권장:</b> 판매자는 발송 증빙(운송장) 등록, 구매자는 수령 직후 사진/영상 기록을 남기는 것을 권장합니다.
            </div>
          </>
        ),
      },
      {
        title: "제 7 조 (취소, 반품, 환불, 분쟁처리)",
        content: (
          <>
            <ul>
              <li>낙찰 후 구매자의 단순변심 취소는 제한될 수 있습니다(판매자 동의 또는 정책상 허용되는 경우 제외).</li>
              <li>다음 사유의 경우, 구매자는 반품/환불을 요청할 수 있습니다: (1) 표시와 현저히 다른 물품, (2) 중대한 하자/파손, (3) 구성품 누락 등</li>
              <li>회사는 분쟁 해결을 위해 증빙자료 제출을 요청할 수 있으며, 제출 거부 또는 허위 제출 시 불이익이 있을 수 있습니다.</li>
              <li>결제 취소 또는 환불이 확정된 경우, 지급된 포인트/혜택은 회수될 수 있습니다.</li>
              <li>부정 이용(사기/도용/허위분쟁 등)이 확인되면 서비스 이용 제한 및 관련 기관 신고 등 조치를 취할 수 있습니다.</li>
            </ul>
            <div className="text-muted small mb-0">
              ※ 실제 운영 시 “환불 가능 기간”, “검수 기간”, “증빙 기준(사진/운송장)” 등을 더 명확히 적으면 좋아요.
            </div>
          </>
        ),
      },
      {
        title: "제 8 조 (금지행위 및 이용제한)",
        content: (
          <>
            <p className="mb-2">
              회원은 다음 각 호의 행위를 하여서는 안 됩니다. 회사는 위반 행위가 확인되면 사전 통지 없이 일부 또는 전체 서비스 이용을 제한할 수 있습니다.
            </p>
            <ul className="mb-0">
              <li>타인 명의/결제수단 도용, 허위정보 등록</li>
              <li>자전거래, 허위 입찰, 가격 조작 등 부정 거래</li>
              <li>불법/금지 품목의 등록 또는 거래 유도</li>
              <li>욕설/비방/스팸, 서비스 장애 유발 행위</li>
              <li>취약점 악용, 비정상적 트래픽 유발, 자동화 도구를 통한 입찰/구매</li>
            </ul>
          </>
        ),
      },
      {
        title: "제 9 조 (회사의 책임 제한)",
        content: (
          <>
            <ul>
              <li>회사는 통신장애, 시스템 점검, 불가항력 사유로 인한 서비스 중단에 대해 법령이 허용하는 범위 내에서 책임을 제한합니다.</li>
              <li>회사는 판매자와 구매자 간 거래의 당사자가 아니며, 거래 당사자 간 분쟁은 원칙적으로 당사자 간 해결을 기본으로 합니다.</li>
              <li>단, 회사는 분쟁의 원활한 해결을 위해 중개/조정/거래기록 제공 등의 범위에서 협조할 수 있습니다.</li>
              <li>회원의 귀책사유(계정관리 소홀, 허위정보, 부정 이용 등)로 발생한 손해에 대해 회사는 책임을 부담하지 않습니다.</li>
            </ul>
          </>
        ),
      },
      {
        title: "제 10 조 (준거법 및 관할)",
        content: (
          <>
            <p>
              본 약관과 서비스 이용에 관한 분쟁은 대한민국 법령을 준거법으로 합니다.
              회사와 회원 간 발생한 분쟁에 관한 소송은 민사소송법 등 관련 법령이 정하는 관할 법원에 제기합니다.
            </p>
            <div className="alert alert-light border mb-0">
              <div className="fw-semibold mb-1">마무리</div>
              <div className="text-muted small">
                본 약관은 프로젝트/시연용으로 작성된 예시 문구입니다. 
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
  const isLast = page === termsPages.length - 1;

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(termsPages.length - 1, p + 1));

  return (
    <div className="container my-5" style={{ maxWidth: 900 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          {/* 헤더 */}
          <div className="text-center mb-3">
            <div className="fw-bold fs-4">이용약관</div>
            <div className="text-muted small">
              경매 · 입찰 · 낙찰 · 결제/포인트 · 배송 · 분쟁처리
            </div>
          </div>

          {/* 진행바 */}
          <div className="progress mb-3" role="progressbar" aria-label="terms progress">
            <div
              className="progress-bar"
              style={{ width: `${((page + 1) / termsPages.length) * 100}%` }}
            />
          </div>

          {/* 섹션 타이틀 */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">{termsPages[page].title}</h5>
            <span className="badge text-bg-light">
              {page + 1} / {termsPages.length}
            </span>
          </div>

          {/* 본문 카드 */}
          <div className="card border-0 bg-light">
            <div className="card-body" style={{ minHeight: 240 }}>
              {termsPages[page].content}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-outline-secondary" onClick={goPrev} disabled={isFirst}>
              이전
            </button>

            <div className="d-flex gap-2">
              {/* 목차/점프(선택) */}
              <select
                className="form-select"
                style={{ width: 220 }}
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
              >
                {termsPages.map((p, idx) => (
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
            ※ 개인정보 처리에 관한 사항은 <b>“<a href="/etc/privacy">개인정보 처리방침</a>”</b> 페이지에서 별도로 안내하고 있습니다.
          </div>
        </div>
      </div>
    </div>
  );
}
