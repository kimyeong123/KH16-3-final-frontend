import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function MemberManage() {
    const [memberList, setMemberList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState("memberId");
    const [keyword, setKeyword] = useState("");
    const [onlyAdmin, setOnlyAdmin] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        loadMemberList();
    }, []);

    const loadMemberList = async () => {
        try {
            const resp = await axios.get("/member/list");
            setMemberList(resp.data);
        }
        catch (e) {
            console.error(e);
            alert("회원 목록을 불러오지 못했습니다");
        }
        finally {
            setLoading(false);
        }
    };
    const load = async () => {

        const resp = await axios.get("/member/list", {
            params: { type, keyword: keyword.trim() }
        });
        setMemberList(resp.data);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        await load();
    };
    const filteredList = onlyAdmin
        ? memberList.filter(m => m.role === "ADMIN")
        : memberList;

    return (
        <div className="container w-800 mt-5">
            <div className="card shadow-sm rounded-4 border-1">
                <div className="card-body table-responsive p-4" style={{overflowY: "auto" }}>

                    <h3 className="fw-bold mb-5 ">회원 관리</h3>
                    <form className="row g-2 align-items-center mb-3" onSubmit={onSubmit}>
                        {/* 옵션 */}
                        <div className="col-2">
                            <select
                                className="form-select form-select-sm"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="memberId">ID</option>
                                <option value="memberNickname">닉네임</option>
                            </select>
                        </div>

                        {/* 입력 */}
                        <div className="col-7">
                            <input
                                className="form-control form-control-sm"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder={
                                    type === "memberId"
                                        ? "회원 ID로 검색"
                                        : "회원 닉네임으로 검색"
                                }
                            />
                        </div>

                        <div className="col-3">
                            <div className="d-flex gap-2 align-items-center">
                                <button type="submit" className="btn btn-sm btn-primary flex-grow-1">
                                    검색
                                </button>

                                <div className="form-check mb-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="onlyAdmin"
                                        checked={onlyAdmin}
                                        onChange={(e) => setOnlyAdmin(e.target.checked)}
                                    />
                                    <label className="form-check-label small" htmlFor="onlyAdmin">
                                        관리자
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>

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
                            {filteredList.map(m => (
                                <tr key={m.memberNo}>
                                    <td>
                                        <span
                                            className="badge bg-success text-primary border"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => navigate(`/member/mypage/${m.memberNo}`)}
                                        >
                                            #{m.memberNo}
                                        </span>
                                    </td>

                                    <td>{m.id}</td>
                                    <td
                                        className="text-truncate"
                                        style={{ maxWidth: "120px" }}
                                        title={m.nickname} 
                                    > 
                                    {m.nickname}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${m.role === "ADMIN"
                                                ? "bg-primary"
                                                : "bg-secondary-subtle text-dark"
                                                }`}
                                        >
                                            {m.role}
                                        </span>
                                    </td>
                                    <td>{m.point.toLocaleString()}</td>
                                    <td>
                                        {m.createdTime
                                            ? new Date(m.createdTime).toLocaleDateString("ko-KR")
                                            : "-"}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
