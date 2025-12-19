// src/components/Header.js

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo2 from '../assets/logo2.png';
import { FaSearch } from 'react-icons/fa';
import Menu from "./Menu";
import { FaHouse, FaRegBell, FaRegUser } from "react-icons/fa6";
import { useAtom, useSetAtom } from "jotai";
import { clearLoginState, loginCompleteState, loginNicknameState, loginRoleState, loginState } from "../utils/jotai";
import axios from "axios";
import { BsLightningCharge } from "react-icons/bs";
import { RiAuctionLine, RiErrorWarningLine, RiCustomerService2Line } from "react-icons/ri";
import MessageBadge from "./message/MessageBadge";

const NOTIFICATION_COUNT_URL = "/message/unread/count";
const POLLING_INTERVAL = 30000;
const NOTIFICATION_LIST_URL = "/message/unread/list";

const getNotificationIcon = (type) => {
    switch (type) {
        case 'SYSTEM_ALERT':
            return <BsLightningCharge className="text-danger me-2" />;
        case 'SELLER_QNA':
            return <RiErrorWarningLine className="text-warning me-2" />;
        case 'GENERAL':
            return <FaRegBell className="text-primary me-2" />;
        default:
            return <FaRegBell className="text-muted me-2" />;
    }
};

export default function Header() {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const dropdownRef = useRef(null);

    const [loginNickname] = useAtom(loginNicknameState);
    const [loginRole] = useAtom(loginRoleState);
    const [isLogin] = useAtom(loginState);
    const clearLogin = useSetAtom(clearLoginState);
    const [, setLoginComplete] = useAtom(loginCompleteState);

    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {
        if (!keyword.trim()) return;
        navigate(`/product/auction/list?q=${encodeURIComponent(keyword)}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    const fetchNotifications = useCallback(async () => {
        if (!isLogin) return;
        setIsLoading(true);
        try {
            const response = await axios.get(NOTIFICATION_LIST_URL);
            setNotifications(response.data);
        } catch (error) {
            console.error("알림 목록 로딩 실패", error);
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    }, [isLogin]);

    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen(prev => !prev);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const changeTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    const filteredNotifications = notifications.filter(notif => {
        if (notif.isRead === 'Y') return false;
        if (activeTab === 'all') return true;
        if (activeTab === 'important') return notif.type === 'SYSTEM_ALERT';
        if (activeTab === 'personal') return notif.type === 'GENERAL' || notif.type === 'SELLER_QNA';
        return false;
    });

    const logout = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        clearLogin();
        setLoginComplete(true);
        delete axios.defaults.headers.common["Authorization"];
        navigate("/");
    }, [clearLogin, navigate, setLoginComplete]);

    useEffect(() => {
        if (!isLogin) {
            setUnreadCount(0);
            return;
        }
        const fetchUnreadCount = async () => {
            try {
                const response = await axios.get(NOTIFICATION_COUNT_URL);
                setUnreadCount(Number(response.data.unreadCount) || 0);
            } catch (error) {
                setUnreadCount(0);
            }
        };
        fetchUnreadCount();
        const intervalId = setInterval(fetchUnreadCount, POLLING_INTERVAL);
        return () => clearInterval(intervalId);
    }, [isLogin]);

    useEffect(() => {
        if (isLogin && isDropdownOpen) fetchNotifications();
    }, [isLogin, isDropdownOpen, fetchNotifications]);

    const handleNotifClick = async (notif) => {
        setIsDropdownOpen(false);
        if (notif.isRead === 'N') {
            try {
                await axios.get(`/message/${notif.messageNo}`);
            } catch (e) {
                console.error("읽음 처리 실패", e);
            }
        }
        if (notif.type === 'SYSTEM_ALERT' && notif.url) {
            navigate(notif.url);
        } else {
            navigate(`/message/${notif.messageNo}`);
        }
    };

    const handleReadAll = async () => {
        try {
            await axios.patch("/message/read-all");
            setUnreadCount(0);
            fetchNotifications();
        } catch (error) {
            console.error("전체 읽음 처리 실패", error);
        }
    };

    return (
        <header className="fixed-top bg-white border-bottom" style={{ zIndex: 1040 }}>
            <div className="container-fluid py-1 d-flex justify-content-between align-items-center">
                
                {/* 1. 로고 영역 */}
                <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center ms-2" to="/">
                    <img src={logo2} style={{ width: '40px', height: '40px', marginRight: '10px' }} alt="bidHouse Logo" />
                    <span className="text-black d-none d-md-inline">bidHouse</span>
                </Link>

                {/* 2. 검색창 영역 */}
                <div className="flex-grow-1 mx-2 mx-md-5">
                    <div className="input-group" style={{ maxWidth: '400px', margin: '0 auto' }}>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="물품명"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="btn btn-outline-primary btn-sm" onClick={handleSearch}>
                            <FaSearch />
                        </button>
                    </div>
                </div>

                {/* 3. 오른쪽 유틸리티 영역 */}
                <div className="d-flex align-items-center fs-6 me-2">
                    {/* 알림 드롭다운 영역 */}
                    <div ref={dropdownRef} className="dropdown me-2 me-md-3">
                        <MessageBadge
                            isLogin={isLogin}
                            onClick={toggleDropdown}
                            isDropdownOpen={isDropdownOpen}
                            unreadCount={unreadCount}
                        />
                        
                        {/* 알림 드롭다운 메뉴 본체 */}
                        <div className={`dropdown-menu dropdown-menu-end p-0 shadow ${isDropdownOpen ? 'show' : ''}`} 
                             style={{ width: '300px', position: 'absolute', right: 0, left: 'auto' }}>
                            
                            <div className="d-flex border-bottom text-center">
                                <div className={`py-2 flex-fill ${activeTab === 'all' ? 'text-primary border-bottom border-primary border-2 fw-bold' : 'text-dark'}`} 
                                     onClick={() => changeTab('all')} style={{ cursor: 'pointer', fontSize: '13px' }}>전체 ({notifications.length})</div>
                                <div className={`py-2 flex-fill ${activeTab === 'important' ? 'text-primary border-bottom border-primary border-2 fw-bold' : 'text-dark'}`} 
                                     onClick={() => changeTab('important')} style={{ cursor: 'pointer', fontSize: '13px' }}>중요 ({notifications.filter(n => n.type === 'SYSTEM_ALERT').length})</div>
                                <div className={`py-2 flex-fill ${activeTab === 'personal' ? 'text-primary border-bottom border-primary border-2 fw-bold' : 'text-dark'}`} 
                                     onClick={() => changeTab('personal')} style={{ cursor: 'pointer', fontSize: '13px' }}>개인 ({notifications.filter(n => n.type === 'GENERAL' || n.type === 'SELLER_QNA').length})</div>
                            </div>

                            <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {isLoading ? (
                                    <div className="p-3 text-center text-primary">로딩 중...</div>
                                ) : (
                                    filteredNotifications.length > 0 ? (
                                        filteredNotifications.map(notif => (
                                            <div key={notif.messageNo} 
                                                 className="list-group-item list-group-item-action d-flex flex-column align-items-start py-2" 
                                                 onClick={() => handleNotifClick(notif)} 
                                                 style={{ cursor: 'pointer' }}>
                                                <div className="d-flex align-items-center">
                                                    {getNotificationIcon(notif.type)}
                                                    <small className="mb-0 text-black fw-bold" style={{ fontSize: '12px' }}>
                                                        {notif.content ? (notif.content.length > 25 ? notif.content.substring(0, 25) + '...' : notif.content) : '내용 없음'}
                                                    </small>
                                                </div>
                                                <small className="text-muted ms-4" style={{ fontSize: '11px' }}>
                                                    {new Date(notif.sentTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                                </small>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-center text-muted" style={{ fontSize: '13px' }}>새로운 알림이 없습니다.</div>
                                    )
                                )}
                            </div>

                            <div className="p-2 border-top bg-light rounded-bottom">
                                <div className="d-flex justify-content-between align-items-center px-2">
                                    <Link to="/message/list" className="btn btn-link btn-sm text-decoration-none text-primary p-0" style={{ fontSize: '12px' }}>
                                        전체 쪽지함
                                    </Link>
                                    <button type="button" className="btn btn-link btn-sm text-decoration-none text-secondary p-0" 
                                            style={{ fontSize: '12px' }} onClick={(e) => { e.stopPropagation(); handleReadAll(); }}>
                                        모두 읽음
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 로그인/로그아웃 버튼 영역 */}
                    <div className="d-flex align-items-center">
                        {isLogin ? (
                            <>
                                {/* 화면 작아져도 알림 옆에 로그아웃 표시 */}
                                <button 
                                    className="btn btn-link text-dark text-decoration-none p-0 border-0 fw-bold" 
                                    onClick={logout} 
                                    style={{ cursor: 'pointer', fontSize: '14px' }}
                                >
                                    로그아웃
                                </button>

                                {/* 데스크탑(lg 이상) 전용 메뉴 */}
                                <div className="d-none d-lg-flex align-items-center">
                                    <div className="ms-3 me-3 text-muted">|</div>
                                    <Link className="text-dark text-decoration-none" to="/member/mypage">내 정보</Link>
                                    <div className="ms-3 me-3 text-muted">|</div>
                                    <Link className="text-dark text-decoration-none" to="/qna/main">고객센터</Link>
                                    <div className="ms-3 me-3 text-muted">|</div>
                                    <span className="ms-3 me-3">
                                        <Link className="text-primary text-decoration-none" to="/member/mypage">
                                            <strong>{loginNickname}</strong>
                                        </Link> 님
                                        {loginRole === "ADMIN" && <span className="badge bg-danger ms-2">관리자</span>}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link className="text-dark text-decoration-none fw-bold" to="/member/login" style={{ fontSize: '14px' }}>로그인</Link>
                                <div className="d-none d-lg-flex align-items-center">
                                    <div className="ms-3 me-3 text-muted">|</div>
                                    <Link className="text-dark text-decoration-none" to="/etc/signupagree?next=/member/join">회원가입</Link>
                                    <div className="ms-3 me-3 text-muted">|</div>
                                    <Link className="text-dark text-decoration-none" to="/qna/main">고객센터</Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Menu />

            {/* 모바일 하단바 */}
            <div className="fixed-bottom bg-white border-top d-lg-none py-2 shadow-sm" style={{ zIndex: 1050 }}>
                <div className="container-fluid">
                    <div className="row text-center align-items-center">
                        <div className="col">
                            <Link to="/" className="text-dark text-decoration-none d-flex flex-column align-items-center">
                                <FaHouse className="fs-4 mb-1" />
                                <small style={{ fontSize: '11px', fontWeight: 'bold' }}>홈</small>
                            </Link>
                        </div>
                        <div className="col">
                            <Link to="/product/auction/list" className="text-dark text-decoration-none d-flex flex-column align-items-center">
                                <RiAuctionLine className="fs-4 mb-1" />
                                <small style={{ fontSize: '11px', fontWeight: 'bold' }}>경매</small>
                            </Link>
                        </div>
                        <div className="col">
                            <Link to={isLogin ? "/member/mypage" : "/member/login"} className="text-dark text-decoration-none d-flex flex-column align-items-center">
                                <FaRegUser className="fs-4 mb-1" />
                                <small style={{ fontSize: '11px', fontWeight: 'bold' }}>{isLogin ? '내정보' : '로그인'}</small>
                            </Link>
                        </div>
                        <div className="col">
                            <Link to="/qna/main" className="text-dark text-decoration-none d-flex flex-column align-items-center">
                                <RiCustomerService2Line className="fs-4 mb-1" />
                                <small style={{ fontSize: '11px', fontWeight: 'bold' }}>고객센터</small>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}