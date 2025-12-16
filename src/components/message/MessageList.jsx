// src/components/message/MessageList.js

import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // (가정)
// [수정] 외부 Pagination 컴포넌트 import
import Pagination from "../common/Pagination";

// API 엔드포인트 정의
const RECEIVED_URL = "/message/received/page";
const SENT_URL = "/message/sent/page";


export default function MessageList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeType = searchParams.get('type') || 'received';
    const activeMsgType = searchParams.get('msgType') || 'ALL'; // 유형 필터: 'ALL', 'GENERAL', 등

    // 검색 관련 쿼리 파라미터 상태
    const activeSearchType = searchParams.get('searchType') || 'content';
    const activeKeyword = searchParams.get('keyword') || '';

    const [messageList, setMessageList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // PageVO 필드와 일치하도록 상태 이름 설정
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [dataCount, setDataCount] = useState(0);

    // 검색어 입력 필드를 위한 로컬 상태
    const [searchKeyword, setSearchKeyword] = useState(activeKeyword);

    // [시간 변환 유틸리티 함수]
    const formatTime = (isoTimeString) => {
        if (!isoTimeString) return 'N/A'; // 시간이 없을 경우 처리

        try {
            const date = new Date(isoTimeString);

            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false, // 24시간 형식
            };

            // 'ko-KR' 로케일을 사용하여 한국식 날짜/시간 형식으로 변환
            return date.toLocaleString('ko-KR', options);

        } catch (e) {
            console.error("Invalid date string:", isoTimeString, e);
            return '날짜 오류';
        }
    };

    // [탭 변경 핸들러]
    const changeTab = (type) => {
        // 탭 변경 시 페이지를 1페이지로 리셋하고, msgType과 검색 파라미터는 초기화
        setCurrentPage(1);
        scrollToTop();
        // 현재 searchParams를 복사하고 type 외 모든 필터/검색 파라미터를 제거
        const newParams = Object.fromEntries(searchParams.entries());
        delete newParams.msgType;
        delete newParams.searchType;
        delete newParams.keyword;
        setSearchKeyword(''); // 로컬 상태도 초기화

        if (type === 'received') {
            delete newParams.type; // received가 기본값이므로 type 파라미터 제거
            setSearchParams(newParams);
        } else {
            setSearchParams({ ...newParams, type: type });
        }
    };

    // [쪽지 유형 필터링 핸들러]
    const changeMsgType = (msgType) => {
        // 쪽지 유형 변경 시 페이지는 항상 1페이지로 리셋
        setCurrentPage(1);
        scrollToTop();
        // 현재 URL 파라미터 복사
        const newParams = Object.fromEntries(searchParams.entries());

        if (msgType === 'ALL') {
            // 전체 보기일 경우 msgType 파라미터 제거
            delete newParams.msgType;
            setSearchParams(newParams);
        } else {
            // 쪽지 유형 설정
            setSearchParams({ ...newParams, msgType: msgType });
        }
    };

    //  검색 실행 핸들러
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // 검색 시 페이지 1로 리셋
        scrollToTop();
        // 검색 파라미터 구성
        const newParams = {
            ...Object.fromEntries(searchParams.entries()),
            searchType: activeSearchType,
            keyword: searchKeyword
        };

        // 검색어가 비어있으면 keyword와 searchType 파라미터 제거
        if (!searchKeyword) {
            delete newParams.searchType;
            delete newParams.keyword;
        }

        setSearchParams(newParams);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // 부드러운 스크롤 효과
        });
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        scrollToTop(); // 페이지 변경 후 스크롤
    };


    // [쪽지 목록 로드 함수]
    const loadMessageList = useCallback(async (type) => {
        setIsLoading(true);
        const apiUrl = type === 'sent' ? SENT_URL : RECEIVED_URL;

        // 백엔드에 전달할 쿼리 파라미터 구성
        const requestParams = {
            page: currentPage,
            size: pageSize
        };

        // 수신함(received)일 때만 필터링 유형(msgType) 파라미터 추가
        if (type === 'received' && activeMsgType !== 'ALL') {
            requestParams.types = [activeMsgType];
        }

        // 검색 파라미터 추가
        if (activeKeyword && activeSearchType) {
            requestParams.searchType = activeSearchType;
            requestParams.keyword = activeKeyword;
        }

        try {
            const response = await axios.get(apiUrl, {
                // 모든 파라미터가 담긴 requestParams를 사용
                params: requestParams
            });

            // PageVO 필드에 맞춰 response.data.list와 response.data.dataCount 사용
            const result = response.data;
            setMessageList(result.list || []);
            setDataCount(result.dataCount || 0); // dataCount 필드 사용

        } catch (error) {
            console.error(`[${type}] 메시지 목록 로딩 실패:`, error);
            const errorMessage = error.response?.data?.message || "메시지 목록을 불러오는 데 실패했습니다.";
            toast.error(errorMessage);
            setMessageList([]);
            setDataCount(0);
        } finally {
            setIsLoading(false);
        }
        //  의존성 배열에 activeKeyword, activeSearchType 추가
    }, [currentPage, pageSize, activeMsgType, activeKeyword, activeSearchType]);



    // [탭 변경(activeType) 또는 페이지 변경 시 목록을 다시 로드하는 useEffect]
    useEffect(() => {
        loadMessageList(activeType);
        // 의존성 배열에 activeKeyword, activeSearchType 추가
    }, [activeType, loadMessageList, currentPage, activeMsgType, activeKeyword, activeSearchType]);

    // render
    return (<>
        <div className="container mt-4">
            {/* 탭 네비게이션 */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeType === 'received' ? 'active' : ''}`}
                        onClick={() => changeTab('received')}
                    >
                        <span className="text-primary">수신함</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeType === 'sent' ? 'active' : ''}`}
                        onClick={() => changeTab('sent')}
                    >
                        <span className="text-primary">발신함</span>
                    </button>
                </li>
            </ul>

            {/* 수신함 (received) 탭일 때만 쪽지 유형 필터링 버튼 표시 */}
            {activeType === 'received' && (
                <div className="d-flex mb-3">
                    <button
                        className={`btn btn-sm me-2 ${activeMsgType === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => changeMsgType('ALL')}
                    >
                        전체 쪽지
                    </button>
                    <button
                        className={`btn btn-sm me-2 ${activeMsgType === 'GENERAL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => changeMsgType('GENERAL')}
                    >
                        일반 쪽지
                    </button>
                    <button
                        className={`btn btn-sm me-2 ${activeMsgType === 'SYSTEM_ALERT' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => changeMsgType('SYSTEM_ALERT')}
                    >
                        시스템 알림
                    </button>
                    <button
                        className={`btn btn-sm me-2 ${activeMsgType === 'SELLER_QNA' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => changeMsgType('SELLER_QNA')}
                    >
                        판매자 문의
                    </button>
                </div>
            )}

            {/* 검색 폼 */}
            <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group" style={{ maxWidth: '450px' }}>
                    <select
                        className="form-select"
                        value={activeSearchType}
                        onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams.entries()), searchType: e.target.value })}
                    >
                        <option value="content">내용</option>
                        <option value="nickname">
                            {activeType === 'received' ? '보낸 사람' : '받는 사람'}
                        </option>
                    </select>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="검색어를 입력하세요."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">검색</button>
                    {activeKeyword && (
                        <button type="button" className="btn btn-secondary" onClick={() => {
                            setSearchKeyword('');
                            // keyword와 searchType 파라미터 제거
                            const newParams = Object.fromEntries(
                                Array.from(searchParams.entries()).filter(([key]) => key !== 'keyword' && key !== 'searchType')
                            );
                            setSearchParams(newParams);
                            setCurrentPage(1);
                        }}>초기화</button>
                    )}
                </div>
            </form>

            {/* 컨텐츠 영역 */}
            {isLoading ? (
                <div className="text-center py-5">로딩 중...</div>
            ) : (
                <>
                    {/* dataCount 표시 */}
                    <p className="text-muted">{activeType === 'received' ? '받은 쪽지' : '보낸 쪽지'} {dataCount}개</p>

                    {messageList.length > 0 ? (
                        <div>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>번호</th>
                                        <th className="col-2">{activeType === 'received' ? '보낸 사람' : '받는 사람'}</th>
                                        <th className="col-4">내용</th>
                                        <th>유형</th>
                                        <th>발신 시각</th>
                                        <th>확인 여부</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messageList.map((message) => (
                                        <tr
                                            key={message.messageNo}
                                            className={message.isRead === 'N' ? 'fw-bold' : ''}
                                            onClick={() => navigate(`/message/${message.messageNo}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>{message.messageNo}</td>
                                            <td>
                                                {activeType === 'received' ? message.senderNickname : message.receiverNickname}
                                            </td>
                                            <td>
                                                {message.content && message.content.length > 30 ?
                                                    `${message.content.substring(0, 30)}...` : message.content}
                                            </td>
                                            <td>{message.type}</td>
                                            <td>{formatTime(message.sentTime)}</td>
                                            <td>{message.isRead === 'Y' ? '읽음' : '안 읽음'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* 외부 Pagination 컴포넌트 사용 */}
                            <Pagination
                                dataCount={dataCount}
                                pageSize={pageSize}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />

                        </div>
                    ) : (
                        <div className="alert alert-info text-center">
                            현재 {activeType === 'received' ? '받은' : '보낸'} 쪽지가 없습니다.
                        </div>
                    )}
                </>
            )}
        </div>
    </>)
}