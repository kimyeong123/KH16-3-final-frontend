import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAtom } from 'jotai';
import { loginIdState } from '../../utils/jotai'; // 현재 로그인된 ID를 비교하기 위해 불러옵니다.

// 백엔드 상세 조회 기본 경로 (GET /message/:messageNo)
const DETAIL_BASE_URL = "/message";

export default function MessageDetail() {
    const navigate = useNavigate();
    // URL 파라미터에서 messageNo를 가져옵니다.
    const { messageNo } = useParams();
    const [loginId] = useAtom(loginIdState); // 현재 로그인된 사용자 ID

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const formatTime = (isoTimeString) => {
        if (!isoTimeString) return 'N/A'; // 시간이 없을 경우 처리

        try {
            const date = new Date(isoTimeString);

            // KST (한국 표준시)로 변환 (별도로 지정하지 않으면 브라우저의 로컬 시간대로 변환됨)
            // 옵션을 통해 원하는 형식으로 지정합니다.
            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false, // 24시간 형식
                // timeZone: 'Asia/Seoul' // 명시적으로 KST 지정 (필요 시)
            };

            // 'ko-KR' 로케일을 사용하여 한국식 날짜/시간 형식으로 변환
            return date.toLocaleString('ko-KR', options);

        } catch (e) {
            console.error("Invalid date string:", isoTimeString, e);
            return '날짜 오류';
        }
    };

    /**
     * 쪽지 상세 정보를 서버에서 불러오는 함수
     */
    const loadMessageDetail = useCallback(async () => {
        // messageNo가 없거나 숫자가 아니면 리다이렉션
        if (!messageNo || isNaN(messageNo)) {
            toast.error("유효하지 않은 쪽지 번호입니다.");
            navigate('/message');
            return;
        }

        setIsLoading(true);
        try {
            // GET /message/{messageNo} 호출
            const response = await axios.get(`${DETAIL_BASE_URL}/${messageNo}`);

            // 백엔드에서 받은 DTO 전체를 상태에 저장
            setMessage(response.data);

        } catch (error) {
            console.error(`쪽지 상세 로딩 실패 (No: ${messageNo}):`, error);
            const errorMessage = error.response?.data?.message || "쪽지 상세 정보를 불러오는 데 실패했습니다.";
            toast.error(errorMessage);
            setMessage(null);
        } finally {
            setIsLoading(false);
        }
    }, [messageNo, navigate]);

    useEffect(() => {
        loadMessageDetail();
    }, [loadMessageDetail]);

    /**
 * [답장] 버튼 클릭 핸들러
 */
    const handleReply = () => {
        if (!message) return;

        // 1. 답장할 상대방 닉네임 결정
        const targetNickname = (message.senderId === loginId)
            ? message.receiverNickname // 발신함 쪽지였으면 받는 사람
            : message.senderNickname; // 수신함 쪽지였으면 보낸 사람

        // 2. 인용할 원문 내용 포매팅
        const quotedContent = `\n\n---------- 원문 내용 ----------\n${message.content}\n-----------------------------------\n`;

        // 3. 답장 데이터 객체 생성
        const replyData = {
            to: targetNickname,
            quote: quotedContent
        };

        // 4. 로컬 스토리지에 데이터 저장
        localStorage.setItem('replyMessageData', JSON.stringify(replyData));

        // 5. 경로로 한 번만 이동
        navigate(`/message/write`);

    };

    /**
     * [목록] 버튼 클릭 핸들러
     */
    const handleList = () => {
        // 쪽지 목록 기본 경로로 이동
        navigate('/message/list');
    };

    // 삭제 핸들러
    const handleDelete = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        const deleteEndpoint = isSentMessage ? `/message/delete/sender/${messageNo}` : `/message/delete/receiver/${messageNo}`;

        try {
            await axios.delete(deleteEndpoint);
            toast.success("메세지가 성공적으로 삭제되었습니다.");
            navigate("/message/list");
        } catch (error) {
            console.error("메세지 삭제 실패:", error);
            const errorMessage = error.response?.data?.message || "메세지 삭제에 실패했습니다.";
            toast.error(errorMessage);
        }
    };


    // 로딩 및 데이터 없음 상태 처리
    if (isLoading) {
        return <div className="text-center py-5 text-primary">쪽지 상세 정보를 불러오는 중...</div>;
    }

    if (!message) {
        return <div className="alert alert-danger text-center mt-5">해당 쪽지(No: {messageNo})를 찾을 수 없거나 접근 권한이 없습니다.</div>;
    }

    // 렌더링 시 필요한 정보 계산
    // 현재 쪽지가 '내'가 보낸 쪽지인지 확인 (발신함/수신함 구분 기준)
    const isSentMessage = message.senderId === loginId;

    // 화면에 표시할 상대방 정보
    const displayTarget = isSentMessage ? message.receiverNickname : message.senderNickname;
    const displayLabel = isSentMessage ? '받는 사람' : '보낸 사람';

    return (
        <div className="container mt-5" style={{ maxWidth: '800px' }}>

            <div className="card shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <span className="text-muted">No. {message.messageNo}</span>
                    <span className={`badge ${message.isRead === 'Y' ? 'bg-secondary' : 'bg-success'}`}>
                        {isSentMessage ? '발신함' : (message.isRead === 'Y' ? '읽음' : '새 쪽지')}
                    </span>
                </div>

                <div className="card-body">
                    <div className="mb-3 p-2 border-bottom">
                        <span className="fw-bold me-2">{displayLabel}:</span>
                        <span className="text-primary fw-bold">{displayTarget}</span>
                    </div>

                    <div className="mb-3 p-2">
                        <span className="fw-bold me-2">유형:</span>
                        <span>{message.type || '일반'}</span>
                    </div>

                    <div className="p-3 border rounded bg-white" style={{ minHeight: '150px', whiteSpace: 'pre-wrap' }}>
                        {/* 쪽지 내용 */}
                        {message.content}
                    </div>
                </div>

                <div className="card-footer text-muted d-flex justify-content-between">
                    <small>발신 시각: {formatTime(message.sentTime)}</small>
                    <small>확인 시간: {formatTime(message.readTime) || '미확인'}</small>
                </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
                {/* 1. 왼쪽 그룹: 목록 버튼 */}
                <button
                    className="btn btn-secondary text-start me-2"
                    onClick={handleList}
                >
                    목록으로
                </button>

                {/* 2. 오른쪽 그룹: 답장 및 삭제 버튼을 d-flex로 묶어 오른쪽으로 밀어냅니다 */}
                <div className="d-flex">
                    {/* 삭제 버튼 */}
                    <button
                        className="btn btn-outline-danger me-2"
                        onClick={handleDelete}
                    >
                        삭제
                    </button>
                        <button
                            className="btn btn-primary me-2"
                            onClick={handleReply}
                        >
                            답장
                        </button>
                </div>
            </div>
        </div>
    );
}