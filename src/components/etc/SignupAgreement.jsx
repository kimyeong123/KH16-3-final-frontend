import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./etc.css"; // ✅ 이 파일 추가

export default function SignupAgreement() {
    const navigate = useNavigate();

    const items = useMemo(
        () => [
            {
                key: "terms",
                title: "이용약관 동의",
                required: true,
                summary: (
                    <>
                        <p className="mb-2">
                            회원가입 및 서비스 제공을 위한 기본 약관입니다.
                        </p>
                        <ul className="list-unstyled mb-0">
                            <li>• 계정 생성 및 회원관리</li>
                            <li>• 부정 이용 방지 및 제재</li>
                            <li>• 서비스 운영을 위한 공지/안내</li>
                        </ul>
                    </>
                ),
            },
            {
                key: "privacy",
                title: "개인정보 처리방침 동의",
                required: true,
                summary: (
                    <>
                        <p className="mb-2">
                            서비스 제공을 위해 필요한 최소한의 정보를 수집/이용합니다.
                        </p>
                        <ul className="list-unstyled mb-0">
                            <li>• 수집: 아이디, 비밀번호(암호화), 이메일, 연락처 등</li>
                            <li>• 목적: 회원관리, 고객문의 처리</li>
                            <li>• 보관: 탈퇴 시 또는 법령 기준</li>
                        </ul>
                    </>
                ),
            },
            {
                key: "marketing",
                title: "마케팅 정보 수신 동의",
                required: false,
                summary: (
                    <>
                        <p className="mb-2">이벤트/혜택 안내를 받을 수 있어요.</p>
                        <ul className="list-unstyled mb-0">
                            <li>• 이메일/문자 수신</li>
                            <li>• 미동의 시에도 회원가입/이용 가능</li>
                        </ul>
                    </>
                ),
            },
        ],
        []
    );

    const [checks, setChecks] = useState({
        terms: false,
        privacy: false,
        marketing: false,
    });

    const requiredOk = checks.terms && checks.privacy;
    const allChecked = items.every((it) => checks[it.key]);

    const toggleAll = (value) => {
        const next = { ...checks };
        items.forEach((it) => (next[it.key] = value));
        setChecks(next);
    };

    const toggleOne = (key) => {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const goJoin = () => {
        if (!requiredOk) return;
        sessionStorage.setItem("signup_agreed", "true");
        navigate("/member/join", {
            state: {
                agreedTerms: checks.terms,
                agreedPrivacy: checks.privacy,
                agreedMarketing: checks.marketing,
            },
        });
    };

    return (
        <div className="document-container agreement-center">
            <div className="text-center mb-4">
                <div className="fw-bold fs-4">회원가입 약관 동의</div>
                <div className="text-muted small mt-1">
                    필수 항목 동의 후 회원가입을 진행할 수 있어요.
                </div>
            </div>

            {/* 전체 동의 */}
            <div className="agreement-paper-block mb-3">
                <div className="fw-semibold">전체 동의</div>

                <div className="d-flex justify-content-center mt-1">
                    <div className="form-check form-switch m-0">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="agreeAll"
                            checked={allChecked}
                            onChange={(e) => toggleAll(e.target.checked)}
                        />
                    </div>
                </div>              
            </div>

            {/* 항목들 */}
            <div className="d-flex flex-column gap-3">
                {items.map((it) => (
                    <div className="agreement-paper-block" key={it.key}>
                        <div className="text-center">
                            <div className="fw-semibold">
                                {it.title}{" "}
                                {it.required ? (
                                    <span className="badge text-bg-danger ms-2">필수</span>
                                ) : (
                                    <span className="badge text-bg-secondary ms-2">선택</span>
                                )}
                            </div>
                            <div className="text-muted small mt-1">
                                {it.required
                                    ? "회원가입을 위해 동의가 필요합니다."
                                    : "동의하지 않아도 서비스 이용이 가능합니다."}
                            </div>

                            <div className="d-flex justify-content-center mt-3">
                                <div className="form-check m-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={checks[it.key]}
                                        onChange={() => toggleOne(it.key)}
                                        id={`chk-${it.key}`}
                                    />
                                    <label className="form-check-label ms-2" htmlFor={`chk-${it.key}`}>
                                        동의합니다
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="agreement-summary mt-3">{it.summary}</div>
                    </div>
                ))}
            </div>

            {/* 버튼 */}
            <div className="mt-4">
                <button
                    className="btn btn-success w-50 py-2"
                    disabled={!requiredOk}
                    onClick={goJoin}
                >
                    동의하고 회원가입
                </button>
            </div>

            {!requiredOk && (
                <div className="text-muted small mt-3 text-center">
                    필수 항목(이용약관, 개인정보 처리방침)에 동의해야 진행할 수 있어요.
                </div>
            )}
        </div>
    );
}
