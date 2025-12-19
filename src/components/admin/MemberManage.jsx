import { useEffect, useState } from "react";
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

    useEffect(() => {
        if (accessToken) {
            loadMemberList(1);
        } else {
            setLoading(false);
        }
    }, [accessToken]);

    const mapType = (t) => {
        if (t === "memberId") return "id";
        if (t === "memberNickname") return "nickname";
        return null;
    };

    const loadMemberList = async (targetPage = page) => {
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
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
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
    };

    const onSubmit = (e) => {
        e.preventDefault();
        loadMemberList(1);
    };

    const filteredList = onlyAdmin
        ? memberList.filter((m) => m.role === "ADMIN")
        : memberList;

    return (
        <div className="container w-800 mt-5">
            <div className="card shadow-sm rounded-4 border-1">
                <div className="card-body table-responsive p-4" style={{ overflowY: "auto" }}>
                    <h3 className="fw-bold mb-5">회원 관리</h3>

                    {/* 토큰 없음 안내 */}
                    {!accessToken && (
                        <div className="alert alert-warning py-2 mb-3">
                            관리자 인증 토큰이 없습니다. 로그인 후 이용해주세요.
                        </div>
                    )}

                    {/* 검색 */}
                    <form className="row g-2 align-items-center mb-3" onSubmit={onSubmit}>
                        <div className="col-2">
                            <select
                                className="form-select form-select-sm"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                disabled={!accessToken || loading}
                            >
                                <option value="memberId">ID</option>
                                <option value="memberNickname">닉네임</option>
                            </select>
                        </div>

                        <div className="col-7">
                            <input
                                className="form-control form-control-sm"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder={type === "memberId" ? "회원 ID로 검색" : "회원 닉네임으로 검색"}
                                disabled={!accessToken || loading}
                            />
                        </div>

                        <div className="col-3">
                            <div className="d-flex gap-2 align-items-center">
                                <button
                                    type="submit"
                                    className="btn btn-sm btn-primary flex-grow-1"
                                    disabled={!accessToken || loading}
                                >
                                    검색
                                </button>

                                <div className="form-check mb-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="onlyAdmin"
                                        checked={onlyAdmin}
                                        onChange={(e) => setOnlyAdmin(e.target.checked)}
                                        disabled={!accessToken || loading}
                                    />
                                    <label className="form-check-label small" htmlFor="onlyAdmin">
                                        관리자
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* 테이블 */}
                    <table className="table table-hover table-bordered mt-4" style={{ tableLayout: "fixed" }}>
                        <thead className="table-light">
                            <tr>
                                <th>회원번호</th>
                                <th>ID</th>
                                <th>닉네임</th>
                                <th>권한</th>
                                <th>포인트</th>
                                <th>가입일</th>
                            </tr>
                        </thead>

                        <tbody>
                            {!loading &&
                                filteredList.map((m) => (
                                    <tr key={m.memberNo}>
                                        <td>
                                            <span
                                                className="badge bg-success text-primary border"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => navigate(`/member/mypage/${m.memberNo}`)}
                                                title="회원 상세로 이동"
                                            >
                                                #{m.memberNo}
                                            </span>
                                        </td>

                                        <td>{m.id}</td>

                                        <td className="text-truncate" style={{ maxWidth: "120px" }} title={m.nickname}>
                                            {m.nickname}
                                        </td>

                                        <td>
                                            <span
                                                className={`badge ${m.role === "ADMIN" ? "bg-primary" : "bg-secondary-subtle text-dark"
                                                    }`}
                                            >
                                                {m.role}
                                            </span>
                                        </td>

                                        <td>{m.point?.toLocaleString?.() ?? "-"}</td>

                                        <td>
                                            {m.createdTime
                                                ? new Date(m.createdTime).toLocaleDateString("ko-KR")
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}

                            {loading && (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-4">
                                        불러오는 중...
                                    </td>
                                </tr>
                            )}

                            {!loading && accessToken && filteredList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-4">
                                        데이터가 없습니다
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* 페이징 */}
                    {accessToken && pageVO && (
                        <div className="d-flex justify-content-center align-items-center gap-1 mt-3">

                            {/* 이전 블록 */}
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={pageVO.firstBlock || loading}
                                onClick={() => loadMemberList(pageVO.prevPage)}
                                title="이전 블록"
                            >
                                «
                            </button>

                            {/* 이전 페이지 */}
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={page <= 1 || loading}
                                onClick={() => loadMemberList(page - 1)}
                            >
                                이전
                            </button>

                            {/* 페이지 번호 */}
                            {Array.from(
                                { length: pageVO.blockFinish - pageVO.blockStart + 1 },
                                (_, i) => pageVO.blockStart + i
                            ).map((p) => (
                                <button
                                    key={p}
                                    className={`btn btn-sm ${p === page ? "btn-primary" : "btn-outline-primary"
                                        }`}
                                    disabled={loading}
                                    onClick={() => loadMemberList(p)}
                                >
                                    {p}
                                </button>
                            ))}

                            {/* 다음 페이지 */}
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={page >= pageVO.totalPage || loading}
                                onClick={() => loadMemberList(page + 1)}
                            >
                                다음
                            </button>

                            {/* 다음 블록 */}
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={pageVO.lastBlock || loading}
                                onClick={() => loadMemberList(pageVO.nextPage)}
                                title="다음 블록"
                            >
                                »
                            </button>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
