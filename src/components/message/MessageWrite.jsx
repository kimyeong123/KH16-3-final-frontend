// src/components/message/MessageWrite.js

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function MessageWrite() {
    const navigate = useNavigate();
    
    // 상태 정의
    const [receiverNickname, setReceiverNickname] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReplying, setIsReplying] = useState(false);

    // 1. 컴포넌트 마운트 시 URL 파라미터를 읽어와 수신자 닉네임 자동 채우기
    useEffect(() => {
        const storedData = localStorage.getItem('replyMessageData');
        
        if (storedData) {
            try {
                const replyData = JSON.parse(storedData);
                
                // 닉네임 자동 채우기
                if (replyData.to) {
                    setReceiverNickname(replyData.to);
                    setIsReplying(true); // 닉네임이 채워졌으면 답장 모드 활성화
                }
                
                // 원문 내용 인용하여 채우기
                if (replyData.quote) {
                    setContent(`\n\n${replyData.quote}`); 
                }

                // 데이터 사용 후 즉시 로컬 스토리지에서 삭제
                localStorage.removeItem('replyMessageData');
                
            } catch (e) {
                console.error("로컬 스토리지 데이터 파싱 오류:", e);
                localStorage.removeItem('replyMessageData');
            }
        }
    }, []);

    // 2. 쪽지 전송 처리 함수
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!receiverNickname || !content.trim()) {
            toast.warn('받는 사람과 내용을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            // 백엔드로 전송할 데이터 (수신자 닉네임과 내용)
            const payload = {
                // 백엔드 DTO에 맞게 필드명 설정 (예: receiverNickname, content)
                receiverNickname: receiverNickname, 
                content: content,
                type: 'GENERAL' // 기본 쪽지 유형
            };

            // POST /message 엔드포인트 호출
            await axios.post('/message', payload); 

            toast.success('쪽지가 성공적으로 전송되었습니다.');
            
            navigate('/message/list'); 

        } catch (error) {
            console.error('쪽지 전송 실패:', error);
            const errorMessage = error.response?.data?.message || '쪽지 전송에 실패했습니다. (닉네임 오류 등)';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <form onSubmit={handleSubmit}>
                {/* 받는 사람 (닉네임) 입력 필드 */}
                <div className="mb-3">
                    <label className="form-label">받는 사람 (닉네임)</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="수신자 닉네임을 입력하세요"
                        value={receiverNickname}
                        onChange={(e) => setReceiverNickname(e.target.value)}
                        required
                        disabled={isReplying}
                    />
                </div>

                {/* 내용 입력 필드 */}
                <div className="mb-3">
                    <label className="form-label">내용</label>
                    <textarea
                        className="form-control"
                        rows="5"
                        placeholder="쪽지 내용을 입력하세요"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>

                {/* 버튼 그룹 */}
                <div className="d-flex justify-content-end">
                    <button 
                        type="button" 
                        className="btn btn-secondary me-2" 
                        onClick={() => navigate(-1)} // 뒤로 가기
                    >
                        취소
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '전송 중...' : '전송'}
                    </button>
                </div>
            </form>
        </div>
    );
}