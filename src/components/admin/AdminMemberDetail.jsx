import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";

const AdminMemberDetail = () => {
    const { memberNo } = useParams();
    const navigate = useNavigate();
    const [accessToken] = useAtom(accessTokenState);

    // // 상태 관리
    const [member, setMember] = useState(null); // // 회원 정보
    const [history, setHistory] = useState([]); // // 제재 이력
    const [loading, setLoading] = useState(true);
    
    // // 제재 등록 입력 상태
    const [reason, setReason] = useState("");
    const [duration, setDuration] = useState("7");

    // // 모든 데이터(회원정보 + 제재이력) 로드
    const loadAllData = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            // // 1. 회원 상세 정보 조회
            const memberResp = await axios.get(`/admin/members/detail/${memberNo}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setMember(memberResp.data);

            // // 2. 제재 이력 조회 (진행 중인 것 위주)
            const historyResp = await axios.get(`/sanction/active/${memberNo}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setHistory(historyResp.data);
        } catch (e) {
            alert("데이터를 불러오지 못했습니다.");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    }, [memberNo, accessToken, navigate]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    // // 신규 제재 등록
    const handleSanction = async () => {
        if (!reason.trim()) return alert("제재 사유를 입력해주세요.");
        if (!window.confirm(`${duration}일 정지 처리를 진행하시겠습니까?`)) return;

        try {
            await axios.post("/sanction/impose", {
                memberNo: memberNo,
                type: "이용규칙 위반",
                durationDay: parseInt(duration),
                reason: reason
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            alert("제재 완료 및 알림이 발송되었습니다.");
            setReason(""); 
            loadAllData(); // // 목록 갱신
        } catch (e) {
            alert("제재 처리 중 오류가 발생했습니다.");
        }
    };

    // // 제재 해제 처리
    const handleRelease = async (sanctionNo) => {
        const targetNo = sanctionNo || (history.length > 0 ? history[0].sanctionNo : null);
        
        if (!targetNo) return alert("해제할 제재 기록이 없습니다.");
        if (!window.confirm("정지 상태를 해제하시겠습니까?")) return;

        try {
            await axios.patch(`/sanction/release/${targetNo}`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            alert("정지가 해제되었습니다.");
            loadAllData();
        } catch (e) {
            alert("해제 처리 중 오류가 발생했습니다.");
        }
    };

    if (loading) return <div className="p-5 text-center">불러오는 중...</div>;
    if (!member) return <div className="p-5 text-center">정보가 없습니다.</div>;

    return (
        <div className="container mt-4 mb-5" style={{ maxWidth: "900px" }}>
            {/* 상단 바 */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">회원 관리 상세</h3>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                    이전으로
                </button>
            </div>

            <div className="row g-4">
                {/* 왼쪽: 회원 기본 정보 */}
                <div className="col-md-5">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white fw-bold">회원 프로필</div>
                        <div className="card-body">
                            <table className="table table-borderless sm-table">
                                <tbody>
                                    <tr><th className="text-muted">번호</th><td>{member.memberNo}</td></tr>
                                    <tr><th className="text-muted">아이디</th><td>{member.id}</td></tr>
                                    <tr><th className="text-muted">닉네임</th><td>{member.nickname}</td></tr>
                                    <tr><th className="text-muted">이메일</th><td>{member.email || "-"}</td></tr>
                                    <tr><th className="text-muted">권한</th>
                                        <td>
                                            <span className={`badge ${member.role === 'SUSPENDED' ? 'bg-dark' : 'bg-primary'}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr><th className="text-muted">포인트</th><td className="text-primary fw-bold">{member.point?.toLocaleString()} P</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 오른쪽: 신규 제재 등록 */}
                <div className="col-md-7">
                    <div className={`card shadow-sm h-100 ${member.role === 'SUSPENDED' ? 'border-success' : 'border-danger'}`}>
                        <div className={`card-header text-white ${member.role === 'SUSPENDED' ? 'bg-success' : 'bg-danger'}`}>
                            {member.role === 'SUSPENDED' ? "활동 정지 해제" : "신규 활동 정지 등록"}
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center">
                            {member.role === 'SUSPENDED' ? (
                                <div className="text-center py-4">
                                    <p className="mb-3">현재 이 회원은 활동 정지 상태입니다.</p>
                                    <button className="btn btn-success px-5" onClick={() => handleRelease()}>
                                        정지 즉시 해제하기
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">정지 기간</label>
                                        <select className="form-select form-select-sm" value={duration} onChange={e => setDuration(e.target.value)}>
                                            <option value="3">3일</option>
                                            <option value="7">7일</option>
                                            <option value="30">30일</option>
                                            <option value="9999">영구</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">정지 사유</label>
                                        <textarea className="form-control" rows="3" value={reason} 
                                            onChange={e => setReason(e.target.value)} placeholder="회원에게 알림으로 전송됩니다."></textarea>
                                    </div>
                                    <button className="btn btn-danger w-100 fw-bold" onClick={handleSanction} disabled={member.role === 'ADMIN'}>
                                        제재 실행 및 알림 발송
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 하단: 제재 이력 목록 */}
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white fw-bold">활동 제한 이력</div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr className="small text-center">
                                            <th>유형</th>
                                            <th>사유</th>
                                            <th>기간</th>
                                            <th>시작일</th>
                                            <th>종료예정일</th>
                                            <th>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-center">
                                        {history.length === 0 ? (
                                            <tr><td colSpan="6" className="py-4 text-muted">진행 중인 제재 내역이 없습니다.</td></tr>
                                        ) : (
                                            history.map(item => (
                                                <tr key={item.sanctionNo} className="align-middle">
                                                    <td><span className="badge border text-dark">{item.type}</span></td>
                                                    <td className="text-start">{item.reason}</td>
                                                    <td>{item.durationDay}일</td>
                                                    <td className="small">{item.startTime?.substring(0, 10)}</td>
                                                    <td className="small text-danger fw-bold">{item.endTime?.substring(0, 16)}</td>
                                                    <td>
                                                        {item.status === 'Y' && (
                                                            <button className="btn btn-sm btn-outline-success" onClick={() => handleRelease(item.sanctionNo)}>해제</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMemberDetail;