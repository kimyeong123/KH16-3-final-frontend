// src/components/Header.js

import React, { useCallback, useEffect, useState, useRef } from 'react'; // 💡 useRef 추가
import { Link, useNavigate } from 'react-router-dom'; 
import logo2 from '../assets/logo2.png'; 
import { FaSearch } from 'react-icons/fa'; 
import Menu from "./Menu"; 
import { FaRegBell } from "react-icons/fa6";
import { useAtom, useSetAtom } from "jotai"; 
import { accessTokenState, adminState, clearLoginState, loginCompleteState, loginIdState, loginRoleState, loginState } from "../utils/jotai"; 
import axios from "axios";
import { BsLightningCharge, BsTrash3 } from "react-icons/bs";
import { RiErrorWarningLine } from "react-icons/ri"; 


// ***** 더미 알림 데이터 (생략) *****
const MOCK_NOTIFICATIONS = [
    { id: 1, type: 'important', title: '낙찰 성공! [아이템 #123]', detail: '결제 기한이 곧 마감됩니다.', time: '5분 전', icon: <BsLightningCharge className="text-danger me-2" /> },
    { id: 2, type: 'personal', title: '입찰가 갱신: 새로운 최고가 등록', detail: '15분 전', icon: <RiErrorWarningLine className="text-warning me-2" /> },
    { id: 3, type: 'personal', title: '유찰 처리되었습니다. [아이템 #456]', detail: '2시간 전', icon: <BsTrash3 className="text-danger me-2" /> },
    { id: 4, type: 'important', title: '낙찰 실패: 다른 사용자가 낙찰', detail: '1일 전', icon: <BsLightningCharge className="text-muted me-2" /> },
    { id: 5, type: 'personal', title: '새로운 메시지 도착', detail: '2일 전', icon: <FaRegBell className="text-primary me-2" /> },
];

export default function Header() { 
    const navigate = useNavigate();

    // ***** 1. 상태 및 참조 (State & Ref) *****
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    
    // 💡 드롭다운 컨테이너 DOM 참조
    const dropdownRef = useRef(null); 

    // jotai state (생략)
    const [loginId] = useAtom(loginIdState);
    const [loginRole] = useAtom(loginRoleState);
    const [accessToken] = useAtom(accessTokenState);
    const [isLogin] = useAtom(loginState);
    const clearLogin = useSetAtom(clearLoginState);

    // ***** 2. 콜백 및 이펙트 (Callback & Effect) *****

    // [알림 드롭다운 토글]
    const toggleDropdown = useCallback((e) => {
        // 💡 이벤트 버블링 방지 (외부 클릭 로직과 충돌 방지)
        if (e) e.stopPropagation(); 
        setIsDropdownOpen(prev => !prev); 
    }, []);

    // [외부 클릭 감지]
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 드롭다운이 열려 있고, 클릭된 요소가 드롭다운 영역 밖에 있다면 닫기
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

    // [탭 변경 핸들러] (생략)
    const changeTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    // [현재 탭에 맞는 알림 필터링] (생략)
    const filteredNotifications = MOCK_NOTIFICATIONS.filter(notif => {
        if (activeTab === 'all') return true;
        if (activeTab === 'important') return notif.type === 'important';
        if (activeTab === 'personal') return notif.type === 'personal';
        return false;
    });

    // [로그아웃(logout)] (생략)
    const logout = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        clearLogin(); 
        delete axios.defaults.headers.common["Authorization"]; 
        navigate("/"); 
    }, [clearLogin, navigate]);


    // ***** 3. 렌더링 (Render) *****
    return (
        <header className="fixed-top bg-white border-bottom" style={{ zIndex: 1040 }}>
            
            <div className="container-fluid py-1 d-flex justify-content-between align-items-center">
                
                {/* 로고 영역 (생략) */}
                <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center ms-2" to="/">
                    <img src={logo2} style={{ width: '40px', height: '40px', marginRight: '20px' }} alt="bidHouse Logo" />
                    <span className="text-black">bidHouse</span>
                </Link>

                {/* 검색창 영역 (생략) */}
                <div className="flex-grow-1 mx-5">
                    <div className="input-group" style={{ maxWidth: '400px', margin: '0 auto' }}>
                        <input 
                            type="text" 
                            className="form-control form-control-sm" // 높이를 줄이기 위해 sm 클래스 추가
                            placeholder="상품 검색" 
                            aria-label="Search items" 
                        />
                        <button className="btn btn-outline-primary btn-sm" type="button"> 
                            <FaSearch />
                        </button>
                    </div>
                </div>

                {/* 2. 오른쪽 유틸리티 링크 및 알림 영역 */}
                <div className="d-none d-lg-flex align-items-center fs-6 me-2"> 
                    
                    {/* 💡 [수정] 드롭다운 컨테이너에 ref 연결 */}
                    <div ref={dropdownRef} className={isLogin ? "dropdown me-5" : "dropdown me-5 text-muted"}>
                        
                        {/* 2-1. 알림 종 아이콘 (클릭 시 토글) */}
                        <FaRegBell 
                            className={`fs-5 ${isLogin ? 'text-black' : 'text-muted'}`} 
                            style={{ cursor: isLogin ? 'pointer' : 'default' }}
                            aria-expanded={isDropdownOpen}
                            role="button"
                            onClick={isLogin ? toggleDropdown : null} // 💡 이벤트 전달
                        /> 
                        
                        {/* 2-2. 드롭다운 메뉴 (탭 포함) */}
                        <div className={`dropdown-menu dropdown-menu-end p-0 ${isDropdownOpen ? 'show' : ''}`} style={{ width: '300px' }}>
                            
                            {/* 탭 네비게이션 (생략) */}
                            <div className="d-flex border-bottom text-center">
                                {/* ... 탭 내용 ... */}
                                <div 
                                    className={`py-2 flex-fill cursor-pointer ${activeTab === 'all' ? 'text-primary border-bottom border-primary border-2 fw-bold' : 'text-muted'}`}
                                    onClick={() => changeTab('all')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    전체 ({MOCK_NOTIFICATIONS.length})
                                </div>
                                <div 
                                    className={`py-2 flex-fill cursor-pointer ${activeTab === 'important' ? 'text-primary border-bottom border-primary border-2 fw-bold' : 'text-muted'}`}
                                    onClick={() => changeTab('important')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    중요 ({MOCK_NOTIFICATIONS.filter(n => n.type === 'important').length})
                                </div>
                                <div 
                                    className={`py-2 flex-fill cursor-pointer ${activeTab === 'personal' ? 'text-primary border-bottom border-primary border-2 fw-bold' : 'text-muted'}`}
                                    onClick={() => changeTab('personal')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    개인 ({MOCK_NOTIFICATIONS.filter(n => n.type === 'personal').length})
                                </div>
                            </div>

                            {/* 알림 목록 (탭 콘텐츠) (생략) */}
                            <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {filteredNotifications.length > 0 ? (
                                    filteredNotifications.map(notif => (
                                        <div key={notif.id} className="list-group-item list-group-item-action d-flex flex-column align-items-start py-2">
                                            <div className="d-flex align-items-center">
                                                {notif.icon}
                                                <small className="mb-0 text-dark fw-bold">{notif.title}</small>
                                            </div>
                                            <small className="text-muted ms-4">{notif.detail}</small>
                                            <small className="text-muted ms-4">{notif.time}</small>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-center text-muted">알림이 없습니다.</div>
                                )}
                            </div>
                            
                            {/* 전체 쪽지함으로 이동 버튼 (바닥) */}
                            <Link 
                                to="/message/list" 
                                className="dropdown-item text-center border-top py-2" 
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                전체 쪽지함으로 이동 ({MOCK_NOTIFICATIONS.length}개)
                            </Link>

                        </div>
                    </div>
                    
                    {/* 3. 로그인/로그아웃 상태 조건부 렌더링 (생략) */}
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
                            <Link className="text-dark text-decoration-none" to="/member/join">
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
            
            {/* 3. Menu 영역 */}
            <Menu/>
        </header>
    );
}