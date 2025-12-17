// src/components/Header.js

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo2 from '../assets/logo2.png';
import { FaSearch } from 'react-icons/fa';
import Menu from "./Menu";
import { FaRegBell } from "react-icons/fa6"; // 일반 알림 아이콘
import { useAtom, useSetAtom } from "jotai";
import { accessTokenState, adminState, clearLoginState, loginCompleteState, loginIdState, loginRoleState, loginState } from "../utils/jotai";
import axios from "axios";
import { BsLightningCharge, BsTrash3 } from "react-icons/bs"; // 중요 알림 아이콘
import { RiErrorWarningLine } from "react-icons/ri"; // QNA 알림 아이콘
import MessageBadge from "./message/MessageBadge";



// API 엔드포인트 및 폴링 설정
const NOTIFICATION_COUNT_URL = "/message/unread/count";
const POLLING_INTERVAL = 30000; // 30초 (30000ms)
const NOTIFICATION_LIST_URL = "/message/unread/list";


/**
 * 쪽지 TYPE에 따라 적절한 아이콘 컴포넌트를 반환하는 헬퍼 함수
 * @param {string} type - 쪽지 타입 ('GENERAL', 'SYSTEM_ALERT', 'SELLER_QNA')
 */
const getNotificationIcon = (type) => {
    switch (type) {
        case 'SYSTEM_ALERT':
            // 중요/긴급 알림 (예: 낙찰 성공, 결제 마감)
            return <BsLightningCharge className="text-danger me-2" />;
        case 'SELLER_QNA':
            // 문의/답변 알림
            return <RiErrorWarningLine className="text-warning me-2" />;
        case 'GENERAL':
            // 일반적인 사용자 간 쪽지
            return <FaRegBell className="text-primary me-2" />;
        default:
            // 그 외
            return <FaRegBell className="text-muted me-2" />;
    }
};


export default function Header() {
    const navigate = useNavigate();

    // ***** 1. 상태 및 참조 (State & Ref) *****
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    // 드롭다운 컨테이너 DOM 참조
    const dropdownRef = useRef(null);

    // jotai state
    const [loginId] = useAtom(loginIdState);
    const [loginRole] = useAtom(loginRoleState);
    const [accessToken] = useAtom(accessTokenState);
    const [isLogin] = useAtom(loginState);
    const clearLogin = useSetAtom(clearLoginState);
    const [, setLoginComplete] = useAtom(loginCompleteState);

    // [추가] 미확인 알림 개수 상태 (폴링으로 업데이트됨)
    const [unreadCount, setUnreadCount] = useState(0);
    // [추가] 실제 알림 목록 데이터를 저장할 상태 (드롭다운 열릴 때 업데이트됨)
    const [notifications, setNotifications] = useState([]);
    // [추가] 알림 목록 로딩 상태
    const [isLoading, setIsLoading] = useState(false);

    // ***** 2. 콜백 및 이펙트 (Callback & Effect) *****

    // 알림 목록을 서버에서 가져오는 함수
    // 서버가 토큰을 통해 사용자 정보를 파악하므로 별도의 memberNo 인자는 필요 없습니다.
    const fetchNotifications = useCallback(async () => {
        if (!isLogin) return; // 로그인 상태가 아니라면 실행하지 않음

        setIsLoading(true);
        try {
            // GET /message/unread/list 호출
            const response = await axios.get(NOTIFICATION_LIST_URL);

            // 백엔드 응답 형태: List<MessageDto>
            setNotifications(response.data);
        } catch (error) {
            console.error("알림 목록을 가져오는데 실패했습니다.", error);
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    }, [isLogin]); // isLogin 변경 시 fetchNotifications도 갱신되어야 함

    // [알림 드롭다운 토글]
    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen(prev => !prev);
    }, []);

    // [외부 클릭 감지]
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 드롭다운 닫기
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        // 문서 전체에 클릭 이벤트를 등록
        document.addEventListener('mousedown', handleClickOutside);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거 (클린업)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]); // isDropdownOpen이 바뀔 때마다 다시 등록

    // [탭 변경 핸들러]
    const changeTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    // [현재 탭에 맞는 알림 필터링] - 실제 데이터(notifications)와 DB TYPE 사용
    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === 'all') return true;
        // 중요 탭: SYSTEM_ALERT 타입만 필터링
        if (activeTab === 'important') return notif.type === 'SYSTEM_ALERT';
        // 개인 탭: GENERAL 또는 SELLER_QNA 타입 필터링
        if (activeTab === 'personal') return notif.type === 'GENERAL' || notif.type === 'SELLER_QNA';
        return false;
    });


    // [로그아웃(logout)]
    const logout = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();

        clearLogin(); // jotai state 초기화
        setLoginComplete(true);
        delete axios.defaults.headers.common["Authorization"]; // axios 헤더 제거

        navigate("/"); // 메인페이지로 이동 
        closeMenu();
    }, [clearLogin, navigate]);


    // [미확인 알림 개수를 가져오는 useEffect (폴링 적용)]
    useEffect(() => {
        // 비로그인 상태면 데이터를 가져올 필요가 없습니다.
        if (!isLogin) {
            setUnreadCount(0);
            return;
        }

        // 서버에서 미확인 알림 개수를 가져오는 비동기 함수
        const fetchUnreadCount = async () => {
            try {
                // 백엔드 API 호출: GET /message/unread/count
                const response = await axios.get(NOTIFICATION_COUNT_URL);
                
                const count = Number(response.data.unreadCount); 

                // 응답 데이터에서 unreadCount 값을 추출하여 상태 업데이트
                setUnreadCount(count || 0); // // 숫자로 변환된 값을 사용
            } catch (error) {
                console.error("알림 개수를 가져오는데 실패했습니다.", error);
                setUnreadCount(0);
            }
        };

        // 1. 컴포넌트 마운트 및 isLogin이 true가 되었을 때 즉시 호출
        fetchUnreadCount();

        // 2. 지정된 간격(5초)마다 주기적으로 업데이트 (폴링)
        const intervalId = setInterval(fetchUnreadCount, POLLING_INTERVAL);

        // 클린업 함수: 컴포넌트 언마운트 시 인터벌 제거
        return () => clearInterval(intervalId);

    }, [isLogin]);

    // [드롭다운 열릴 때 알림 목록을 가져오는 useEffect]
    useEffect(() => {
        if (isLogin && isDropdownOpen) {
            // 드롭다운이 열렸을 때만 목록 데이터를 가져옴
            fetchNotifications();
        }
    }, [isLogin, isDropdownOpen, fetchNotifications]);


    // ***** 3. 렌더링 (Render) *****
    return (
        <header className="fixed-top bg-white border-bottom" style={{ zIndex: 1040 }}>

            <div className="container-fluid py-1 d-flex justify-content-between align-items-center">

                {/* 1. 로고 영역 */}
                <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center ms-2" to="/">
                    <img src={logo2} style={{ width: '40px', height: '40px', marginRight: '20px' }} alt="bidHouse Logo" />
                    <span className="text-black">bidHouse</span>
                </Link>

                {/* 2. 검색창 영역 */}
                <div className="flex-grow-1 mx-5">
                    <div className="input-group" style={{ maxWidth: '400px', margin: '0 auto' }}>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="상품 검색"
                            aria-label="Search items"
                        />
                        <button className="btn btn-outline-primary btn-sm" type="button">
                            <FaSearch />
                        </button>
                    </div>
                </div>

                {/* 3. 오른쪽 유틸리티 링크 및 알림 영역 */}
                <div className="d-none d-lg-flex align-items-center fs-6 me-2">

                    {/* 드롭다운 컨테이너 */}
                    <div ref={dropdownRef} className={isLogin ? "dropdown me-5" : "dropdown me-5 text-muted"}>

                        {/* 3-1. 알림 종 아이콘 (MessageBadge 컴포넌트) */}
                        <MessageBadge
                            isLogin={isLogin}
                            onClick={toggleDropdown} // 로그인 시 드롭다운 토글
                            isDropdownOpen={isDropdownOpen}
                            unreadCount={unreadCount} // API에서 가져온 미확인 개수 전달
                        />

                        {/* 3-2. 드롭다운 메뉴 (탭 포함) */}
                        <div className={`dropdown-menu dropdown-menu-end p-0 ${isDropdownOpen ? 'show' : ''}`} style={{ width: '300px' }}>

                            {/* 탭 네비게이션 - notifications 데이터 기반으로 개수 표시 */}
                            <div className="d-flex border-bottom text-center">
                                <div
                                    className={`py-2 flex-fill cursor-pointer ${activeTab === 'all' ? 'text-primary border-bottom border-primary border-2 fw-bold' : 'text-dark'}`}
                                    onClick={() => changeTab('all')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    전체 ({notifications.length})
                                </div>
                                <div
                                    className={`py-2 flex-fill cursor-pointer ${activeTab === 'important' ? 'text-primary border-bottom border-primary border-2 fw-bold' : 'text-dark'}`}
                                    onClick={() => changeTab('important')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    중요 ({notifications.filter(n => n.type === 'SYSTEM_ALERT').length})
                                </div>
                                <div
                                    className={`py-2 flex-fill cursor-pointer ${activeTab === 'personal' ? 'text-primary border-bottom border-primary border-2 fw-bold' : 'text-dark'}`}
                                    onClick={() => changeTab('personal')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    개인 ({notifications.filter(n => n.type === 'GENERAL' || n.type === 'SELLER_QNA').length})
                                </div>
                            </div>

                            {/* 알림 목록 (탭 콘텐츠) */}
                            <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {/* 로딩 상태 표시 */}
                                {isLoading ? (
                                    <div className="p-3 text-center text-primary">알림 목록 로딩 중...</div>
                                ) : (
                                    filteredNotifications.length > 0 ? (
                                        // 실제 알림 데이터 렌더링
                                        filteredNotifications.map(notif => (
                                            // messageNo를 key로 사용
                                            <Link key={notif.messageNo} to={`/message/${notif.messageNo}`} className="list-group-item list-group-item-action d-flex flex-column align-items-start py-2">
                                                <div className="d-flex align-items-center">
                                                    {getNotificationIcon(notif.type)} {/* 타입에 맞는 아이콘 표시 */}
                                                    {/* 쪽지 내용의 일부를 제목으로 사용 */}
                                                    <small className="mb-0 text-black fw-bold">{notif.content ? notif.content.substring(0, 30) + (notif.content.length > 30 ? '...' : '') : '알림 내용 없음'}</small>
                                                </div>
                                                {/* 보낸 시간 표시 (실제 데이터 필드에 맞게 조정 필요) */}
                                                <small className="text-muted ms-4">발송: {new Date(notif.sentTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</small>
                                            </Link>
                                        ))
                                    ) : (
                                        // 알림이 없을 때
                                        <div className="p-3 text-center text-muted">알림이 없습니다.</div>
                                    )
                                )}
                            </div>

                            {/* 전체 쪽지함으로 이동 버튼 (바닥) - notifications 데이터 기반으로 개수 표시 */}
                            <Link
                                to="/message/list"
                                className="dropdown-item text-center border-top py-2"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                전체 쪽지함으로 이동 ({notifications.length}개)
                            </Link>

                        </div>
                    </div>

                    {/* 3-3. 로그인/로그아웃 상태 조건부 렌더링 */}
                    {isLogin ? (
                        <div className='d-flex align-items-center'>
                            <Link className="text-success fw-bold text-decoration-none" to="/member/mypage">
                                {loginId} ({loginRole})
                            </Link>
                            <div className="ms-3 me-3">|</div>
                            <Link className="text-dark text-decoration-none" onClick={logout}>
                                로그아웃
                            </Link>
                        </div>
                    ) : (
                        <div className='d-flex align-items-center'>
                            <Link className="text-dark text-decoration-none" to="/member/login">
                                로그인
                            </Link>
                            <div className="ms-3 me-3">|</div>
                            <Link className="text-dark text-decoration-none" to="/etc/signupagree?next=/member/join">
                                회원가입
                            </Link>
                        </div>
                    )}
                    <div className="ms-3 me-3">|</div>
                    <Link className="text-dark text-decoration-none" to="/qna/list">
                        고객센터
                    </Link>
                </div>

            </div>

            {/* 4. Menu 영역 */}
            <Menu />
        </header>
    );
}