// src/components/message/MessageBadge.js

import React from 'react';
import { FaRegBell } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

/**
 * 알림 아이콘과 미확인 뱃지를 렌더링하는 컴포넌트
 * @param {boolean} isLogin - 로그인 상태 여부
 * @param {function} onClick - 클릭 핸들러 (드롭다운 토글)
 * @param {boolean} isDropdownOpen - 드롭다운 열림 상태
 * @param {number} unreadCount - 미확인 알림 개수
 */
export default function MessageBadge({ isLogin, onClick, isDropdownOpen, unreadCount = 0 }) {
    
    const navigate = useNavigate();

    // 로그인 상태가 아닐 때 (클릭 시 로그인 페이지로 이동)
    if (!isLogin) {
        return (
            <div
                role="button"
                onClick={() => navigate('/member/login')} 
                style={{ cursor: 'pointer', display: 'inline-block' }}
            >
                <FaRegBell 
                    className="fs-5 text-muted" 
                />
            </div>
        );
    }
    
    // 로그인 상태일 때
    return (
        <div 
            className="position-relative" 
            onClick={onClick}
            role="button"
            style={{ display: 'inline-block' }} // 부모 div에 이 스타일을 적용해야 배치가 잘 됩니다.
        >
            <FaRegBell 
                className={`fs-5 ${isDropdownOpen ? 'text-primary' : 'text-black'}`}
                aria-expanded={isDropdownOpen}
                style={{ cursor: 'pointer' }}
            />
            
            {unreadCount > 0 && (
                <span 
                    // Bootstrap의 배지 위치 클래스 유지
                    className="position-absolute top-0 start-100 translate-middle bg-danger border border-light rounded-circle"
                    // 텍스트 없이 작은 빨간 점처럼 보이게 스타일 조정
                    style={{ width: '8px', height: '8px', padding: 0 }}
                >
                    {/* 스크린 리더용 숨김 텍스트 */}
                    <span className="visually-hidden">New messages</span>
                </span>
            )}
        </div>
    );
}