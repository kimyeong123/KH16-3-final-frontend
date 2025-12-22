import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Pagination from "../common/Pagination";
import Swal from "sweetalert2";

const RECEIVED_URL = "/message/received/page";
const SENT_URL = "/message/sent/page";

export default function MessageList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeType = searchParams.get('type') || 'received';
    const activeMsgType = searchParams.get('msgType') || 'ALL';
    const activeSearchType = searchParams.get('searchType') || 'content';
    const activeKeyword = searchParams.get('keyword') || '';

    const [messageList, setMessageList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [dataCount, setDataCount] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState(activeKeyword);

    // [추가] 선택된 메시지 번호 관리 상태
    const [selectedIds, setSelectedIds] = useState([]);

    const formatTime = (isoTimeString) => {
        if (!isoTimeString) return 'N/A';
        try {
            const date = new Date(isoTimeString);
            return date.toLocaleString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false
            });
        } catch (e) {
            return '날짜 오류';
        }
    };

    const loadMessageList = useCallback(async (type) => {
        setIsLoading(true);
        const apiUrl = type === 'sent' ? SENT_URL : RECEIVED_URL;
        const requestParams = { page: currentPage, size: pageSize };

        if (type === 'received' && activeMsgType !== 'ALL') {
            requestParams.types = [activeMsgType];
        }
        if (activeKeyword && activeSearchType) {
            requestParams.searchType = activeSearchType;
            requestParams.keyword = activeKeyword;
        }

        try {
            const response = await axios.get(apiUrl, { params: requestParams });
            const result = response.data;
            setMessageList(result.list || []);
            setDataCount(result.dataCount || 0);
            setSelectedIds([]); // 목록 로딩 시 선택 초기화
        } catch (error) {
            toast.error("메시지 목록 로딩 실패");
            setMessageList([]);
            setDataCount(0);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, activeMsgType, activeKeyword, activeSearchType]);

    useEffect(() => {
        loadMessageList(activeType);
    }, [activeType, loadMessageList, currentPage, activeMsgType, activeKeyword, activeSearchType]);

    // [추가] 전체 선택 핸들러
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(messageList.map(m => m.messageNo));
        } else {
            setSelectedIds([]);
        }
    };

    // [추가] 개별 선택 핸들러
    const handleSelectOne = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // [추가] 선택 삭제 실행
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;

        const result = await Swal.fire({
            title: '쪽지 삭제',
            text: `${selectedIds.length}개의 쪽지를 삭제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        });

        if (result.isConfirmed) {
        try {
            // 현재 탭이 수신함이면 receiver, 발신함이면 sender 경로 사용
            const endpoint = activeType === 'received' 
                ? "/message/delete/receiver" 
                : "/message/delete/sender";

            // axios.delete는 두 번째 인자로 data 객체를 전달해야 합니다.
            await axios.delete(endpoint, { data: selectedIds });
            
            toast.success("선택한 쪽지가 삭제되었습니다.");
            setSelectedIds([]); // 선택 상태 비우기
            loadMessageList(activeType); // 목록 새로고침
        } catch (error) {
            console.error("삭제 실패:", error);
            toast.error("삭제 중 오류가 발생했습니다.");
        }
    }
};

    const changeTab = (type) => {
        setCurrentPage(1);
        const newParams = { type: type };
        if (type === 'received') delete newParams.type;
        setSearchParams(newParams);
        setSearchKeyword('');
    };

    const changeMsgType = (msgType) => {
        setCurrentPage(1);
        const newParams = Object.fromEntries(searchParams.entries());
        if (msgType === 'ALL') delete newParams.msgType;
        else newParams.msgType = msgType;
        setSearchParams(newParams);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        const newParams = { ...Object.fromEntries(searchParams.entries()), searchType: activeSearchType, keyword: searchKeyword };
        if (!searchKeyword) { delete newParams.searchType; delete newParams.keyword; }
        setSearchParams(newParams);
    };

    return (
        <div className="container mt-4">
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeType === 'received' ? 'active' : ''}`} onClick={() => changeTab('received')}>
                        <span className="text-primary">수신함</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeType === 'sent' ? 'active' : ''}`} onClick={() => changeTab('sent')}>
                        <span className="text-primary">발신함</span>
                    </button>
                </li>
            </ul>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex">
                    {activeType === 'received' && ['ALL', 'GENERAL', 'SYSTEM_ALERT', 'SELLER_QNA'].map(type => (
                        <button key={type} className={`btn btn-sm me-2 ${activeMsgType === type ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => changeMsgType(type)}>
                            {type === 'ALL' ? '전체' : type === 'GENERAL' ? '일반' : type === 'SYSTEM_ALERT' ? '시스템' : '판매자문의'}
                        </button>
                    ))}
                </div>
                {/* 삭제 버튼 추가 */}
                <button className="btn btn-danger btn-sm" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
                    선택 삭제 ({selectedIds.length})
                </button>
            </div>

            <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group" style={{ maxWidth: '450px' }}>
                    <select className="form-select" value={activeSearchType} 
                        onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams.entries()), searchType: e.target.value })}>
                        <option value="content">내용</option>
                        <option value="nickname">{activeType === 'received' ? '보낸 사람' : '받는 사람'}</option>
                    </select>
                    <input type="text" className="form-control" placeholder="검색어 입력" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                    <button type="submit" className="btn btn-primary">검색</button>
                </div>
            </form>

            {isLoading ? (
                <div className="text-center py-5">로딩 중...</div>
            ) : (
                <>
                    <p className="text-muted">{activeType === 'received' ? '받은 쪽지' : '보낸 쪽지'} {dataCount}개</p>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" className="form-check-input" 
                                        onChange={handleSelectAll} 
                                        checked={messageList.length > 0 && selectedIds.length === messageList.length} />
                                </th>
                                <th>번호</th>
                                <th className="col-2">{activeType === 'received' ? '보낸 사람' : '받는 사람'}</th>
                                <th className="col-4">내용</th>
                                <th>유형</th>
                                <th>발신 시각</th>
                                <th>확인</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messageList.length > 0 ? messageList.map((message) => (
                                <tr key={message.messageNo} className={message.isRead === 'N' ? 'fw-bold' : ''} 
                                    onClick={() => navigate(`/message/${message.messageNo}`)} style={{ cursor: 'pointer' }}>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <input type="checkbox" className="form-check-input" 
                                            checked={selectedIds.includes(message.messageNo)}
                                            onChange={() => handleSelectOne(message.messageNo)} />
                                    </td>
                                    <td>{message.messageNo}</td>
                                    <td>{activeType === 'received' ? message.senderNickname : message.receiverNickname}</td>
                                    <td>{message.content && message.content.length > 30 ? `${message.content.substring(0, 30)}...` : message.content}</td>
                                    <td>{message.type}</td>
                                    <td>{formatTime(message.sentTime)}</td>
                                    <td>{message.isRead === 'Y' ? '읽음' : '안 읽음'}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="text-center py-4">쪽지가 없습니다.</td></tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination dataCount={dataCount} pageSize={pageSize} currentPage={currentPage} onPageChange={(page) => { setCurrentPage(page); window.scrollTo(0,0); }} />
                </>
            )}
        </div>
    );
}