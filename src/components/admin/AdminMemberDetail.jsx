import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { RiErrorWarningFill } from "react-icons/ri"; // // 경고 아이콘 추가

const AdminMemberDetail = () => {
    const { memberNo } = useParams();
    const navigate = useNavigate();
    const [accessToken] = useAtom(accessTokenState);

    const [member, setMember] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState("");
    const [duration, setDuration] = useState("7");

    const loadAllData = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const memberResp = await axios.get(`/admin/members/detail/${memberNo}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setMember(memberResp.data);

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
            loadAllData();
        } catch (e) {
            const msg = e.response?.data?.message || "제재 처리 중 오류가 발생했습니다.";
            alert(msg); // // 서버 에러 메시지 출력
        }
    };

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

    const isSuspended = member.role === 'SUSPENDED';

    return (
        <div className="container mt-4 mb-5" style={{ maxWidth: "900px" }}>
            
            {/* 상단 제목 영역: 깔끔하게 유지 */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">
                    회원 상세 관리 
                    {isSuspended && <span className="ms-2 text-danger fs-6 fw-normal">(정지됨)</span>}
                </h3>
                <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => navigate(-1)}>
                    목록으로
                </button>
            </div>

            <div className="row g-4">
                {/* 왼쪽: 회원 프로필 카드 (배경색 유지) */}
                <div className="col-md-5">
                    <div className={`card shadow-sm h-100 border-0 ${isSuspended ? 'bg-danger-subtle' : ''}`}>
                        <div className="card-header bg-transparent fw-bold py-3 border-0 text-center">회원 프로필</div>
                        <div className="card-body">
                            <div className="text-center mb-4">
                                <div className={`d-inline-block rounded-circle p-3 mb-2 ${isSuspended ? 'bg-danger text-white' : 'bg-primary text-white'}`}>
                                    <RiErrorWarningFill size={40} />
                                </div>
                                <h4 className="fw-bold mb-0">{member.nickname}</h4>
                                <span className="text-muted small">{member.id}</span>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <table className="table table-sm table-borderless mb-0">
                                    <tbody className="align-middle">
                                        <tr><th className="text-muted w-25">번호</th><td className="fw-bold text-end">{member.memberNo}</td></tr>
                                        <tr><th className="text-muted">이메일</th><td className="text-end" style={{fontSize: '13px'}}>{member.email || "-"}</td></tr>
                                        <tr><th className="text-muted">권한</th>
                                            <td className="text-end">
                                                <span className={`badge px-3 ${isSuspended ? 'bg-danger' : 'bg-primary'}`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr><th className="text-muted">포인트</th><td className="text-primary fw-bold text-end">{member.point?.toLocaleString()} P</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 오른쪽: 제재/해제 관리 (카드 상단 라인 포인트) */}
                <div className="col-md-7">
                    <div className={`card shadow-sm h-100 border-0 border-top border-4 ${isSuspended ? 'border-success' : 'border-danger'}`}>
                        <div className="card-header bg-white fw-bold py-3">
                            {isSuspended ? "활동 제한 해제 처리" : "신규 활동 제한 등록"}
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center px-4">
                            {isSuspended ? (
                                <div className="text-center py-4">
                                    <RiErrorWarningFill className="text-danger mb-3" size={50} />
                                    <h5 className="fw-bold">이 회원 정보는 현재 정지 상태입니다</h5>
                                    <p className="text-muted mb-4 small">해제 버튼 클릭 시 즉시 일반 회원으로 복구됩니다.</p>
                                    <button className="btn btn-success btn-lg w-100 fw-bold shadow-sm" onClick={() => handleRelease()}>
                                        정지 상태 즉시 해제
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">정지 기간 설정</label>
                                        <select className="form-select" value={duration} onChange={e => setDuration(e.target.value)}>
                                            <option value="3">3일</option>
                                            <option value="7">7일</option>
                                            <option value="30">30일</option>
                                            <option value="9999">영구</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold">정지 사유</label>
                                        <textarea className="form-control" rows="3" value={reason} 
                                            onChange={e => setReason(e.target.value)} placeholder="사유를 입력하세요."></textarea>
                                    </div>
                                    <button className="btn btn-danger w-100 fw-bold py-2" onClick={handleSanction} disabled={member.role === 'ADMIN'}>
                                        활동 제한 적용
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 하단: 히스토리 목록 영역 */}
                <div className="col-12 mt-2">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white fw-bold py-3 text-center">활동 제한 내용</div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 text-center">
                                    <thead className="table-light small text-secondary">
                                        <tr>
                                            <th>유형</th>
                                            <th>사유</th>
                                            <th>기간</th>
                                            <th>시작일</th>
                                            <th>종료일</th>
                                            <th>비고</th>
                                        </tr>
                                    </thead>
                                    <tbody className="align-middle">
                                        {history.length === 0 ? (
                                            <tr><td colSpan="6" className="py-4 text-muted">제재 내역이 없습니다.</td></tr>
                                        ) : (
                                            history.map(item => (
                                                <tr key={item.sanctionNo}>
                                                    <td><span className="badge border border-danger text-danger fw-normal">{item.type}</span></td>
                                                    <td className="text-start px-3">{item.reason}</td>
                                                    <td>{item.durationDay === 9999 ? '영구' : `${item.durationDay}일`}</td>
                                                    <td className="small text-muted">{item.startTime?.substring(0, 10)}</td>
                                                    <td className="small text-danger fw-bold">{item.endTime?.substring(0, 16)}</td>
                                                    <td>
                                                        {item.status === 'Y' && (
                                                            <button className="btn btn-sm text-success fw-bold p-0" 
                                                                    style={{textDecoration: 'none'}}
                                                                    onClick={() => handleRelease(item.sanctionNo)}>해제</button>
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