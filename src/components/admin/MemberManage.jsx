import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";

export default function MemberManage() {
    const navigate = useNavigate();
    const [accessToken] = useAtom(accessTokenState);

    const [memberList, setMemberList] = useState([]);
    const [pageVO, setPageVO] = useState(null);
    const [loading, setLoading] = useState(true);

    const [type, setType] = useState("memberId");
    const [keyword, setKeyword] = useState("");
    const [onlyAdmin, setOnlyAdmin] = useState(false);

    const [page, setPage] = useState(1);
    const size = 10;

    const mapType = (t) => {
        if (t === "memberId") return "id";
        if (t === "memberNickname") return "nickname";
        return null;
    };

    const loadMemberList = useCallback(async (targetPage = 1) => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const trimmed = keyword.trim();
            const resp = await axios.get("/admin/members", {
                params: {
                    page: targetPage,
                    size,
                    type: trimmed ? mapType(type) : null,
                    keyword: trimmed ? trimmed : null,
                    role: onlyAdmin ? null : "MEMBER_ONLY" 
                },
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            setPageVO(resp.data);
            setMemberList(resp.data.list || []);
            setPage(targetPage);
        } catch (e) {
            console.error(e);
            alert("회원 목록을 불러오지 못했습니다");
        } finally {
            setLoading(false);
        }
    }, [accessToken, keyword, type, onlyAdmin]);

    useEffect(() => {
        if (accessToken) {
            loadMemberList(1);
        } else {
            setLoading(false);
        }
    }, [accessToken, onlyAdmin, loadMemberList]);

    const onSubmit = (e) => {
        e.preventDefault();
        loadMemberList(1);
    };

    return (
        <div className="container-fluid container-lg mt-3 mt-md-5 mb-5">
            <div className="card shadow-sm rounded-4 border-1">
                <div className="card-body p-3 p-md-4">
                    <h3 className="fw-bold mb-4">회원 관리</h3>

                    {!accessToken && (
                        <div className="alert alert-warning py-2 mb-3 small">
                            관리자 인증 토큰이 없습니다. 로그인 후 이용해주세요.
                        </div>
                    )}

                    {/* 검색 영역 반응형 개선 */}
                    <form className="mb-4" onSubmit={onSubmit}>
                        <div className="row g-2">
                            <div className="col-4 col-md-2">
                                <select
                                    className="form-select"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    disabled={!accessToken || loading}
                                >
                                    <option value="memberId">ID</option>
                                    <option value="memberNickname">닉네임</option>
                                </select>
                            </div>
                            <div className="col-8 col-md-6">
                                <input
                                    className="form-control"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="검색어 입력"
                                    disabled={!accessToken || loading}
                                />
                            </div>
                            <div className="col-12 col-md-4 d-flex gap-2 justify-content-between align-items-center mt-2 mt-md-0">
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-grow-1"
                                    disabled={!accessToken || loading}
                                >
                                    검색
                                </button>
                                <div className="form-check mb-0 flex-shrink-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="onlyAdmin"
                                        checked={onlyAdmin}
                                        onChange={(e) => setOnlyAdmin(e.target.checked)}
                                        disabled={!accessToken || loading}
                                    />
                                    <label className="form-check-label small" htmlFor="onlyAdmin" style={{ whiteSpace: 'nowrap' }}>
                                        관리자 포함
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* PC용 테이블 (768px 이상) */}
                    <div className="d-none d-md-block table-responsive">
                        <table className="table table-hover table-bordered align-middle">
                            <thead className="table-light text-center">
                                <tr>
                                    <th style={{ width: '80px' }}>번호</th>
                                    <th>ID</th>
                                    <th>닉네임</th>
                                    <th style={{ width: '110px' }}>권한</th>
                                    <th>포인트</th>
                                    <th>가입일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!loading && memberList.map((m) => (
                                    <tr key={m.memberNo} onClick={() => navigate(`/admin/home/member/detail/${m.memberNo}`)} style={{ cursor: 'pointer' }}>
                                        <td className="text-center"><span className="badge bg-light text-dark border">#{m.memberNo}</span></td>
                                        <td>{m.id}</td>
                                        <td className="text-truncate" style={{maxWidth: '150px'}}>{m.nickname}</td>
                                        <td className="text-center">
                                            <span className={`badge ${m.role === 'ADMIN' ? 'bg-danger' : m.role === 'SUSPENDED' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                                                {m.role}
                                            </span>
                                        </td>
                                        <td className="text-end">{m.point?.toLocaleString() ?? "0"}</td>
                                        <td className="text-center">{m.createdTime ? new Date(m.createdTime).toLocaleDateString("ko-KR") : "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 모바일용 카드 리스트 (768px 미만) */}
                    <div className="d-md-none">
                        {!loading && memberList.map((m) => (
                            <div key={m.memberNo} className="card mb-2 border rounded-3 p-3" onClick={() => navigate(`/admin/home/member/detail/${m.memberNo}`)}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="badge bg-light text-dark border">#{m.memberNo}</span>
                                    <span className={`badge ${m.role === 'ADMIN' ? 'bg-danger' : m.role === 'SUSPENDED' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                                        {m.role}
                                    </span>
                                </div>
                                <div className="fw-bold text-primary mb-1">{m.nickname} <span className="text-muted small fw-normal">({m.id})</span></div>
                                <div className="d-flex justify-content-between small text-muted">
                                    <span>포인트: {m.point?.toLocaleString()} P</span>
                                    <span>{m.createdTime ? new Date(m.createdTime).toLocaleDateString("ko-KR") : "-"}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 공통 로딩/데이터 없음 처리 */}
                    {loading && <div className="text-center py-5 text-muted">데이터를 불러오는 중...</div>}
                    {!loading && memberList.length === 0 && <div className="text-center py-5 text-muted">검색 결과가 없습니다.</div>}

                    {/* 페이지네이션 반응형 */}
                    {accessToken && pageVO && (
                        <div className="d-flex flex-wrap justify-content-center align-items-center gap-1 mt-4">
                            <button className="btn btn-outline-secondary btn-sm px-2" disabled={pageVO.firstBlock || loading} onClick={() => loadMemberList(pageVO.prevPage)}>«</button>
                            
                            <div className="d-flex gap-1">
                                {Array.from({ length: pageVO.blockFinish - pageVO.blockStart + 1 }, (_, i) => pageVO.blockStart + i).map((p) => (
                                    <button
                                        key={p}
                                        className={`btn btn-sm ${p === page ? "btn-primary" : "btn-outline-primary"}`}
                                        disabled={loading}
                                        onClick={() => loadMemberList(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <button className="btn btn-outline-secondary btn-sm px-2" disabled={pageVO.lastBlock || loading} onClick={() => loadMemberList(pageVO.nextPage)}>»</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}