// src/components/Header.js

import React, { useCallback, useEffect } from 'react'; // 
import { Link, useNavigate } from 'react-router-dom'; 
import logo2 from '../assets/logo2.png'; 
import { FaSearch } from 'react-icons/fa'; 
import Menu from "./Menu"; 
import { FaRegBell } from "react-icons/fa6";
import { RiLoginBoxFill, RiLogoutBoxFill } from "react-icons/ri"; 

import { useAtom, useSetAtom } from "jotai"; 
import { accessTokenState, adminState, clearLoginState, loginCompleteState, loginIdState, loginRoleState, loginState } from "../utils/jotai"; 
import axios from "axios";


export default function Header() { 
    const navigate = useNavigate();

    // jotai state (Jotai 훅스 사용)
    const [loginId] = useAtom(loginIdState);
    const [loginRole] = useAtom(loginRoleState);
    const [accessToken] = useAtom(accessTokenState);
    // const [, setLoginComplete] = useAtom(loginCompleteState); // 사용하지 않으므로 주석 처리
    
    // jotai selector
    const [isLogin] = useAtom(loginState);
    const [isAdmin] = useAtom(adminState);

    // jotai 초기화 함수 (쓰기 전용)
    const clearLogin = useSetAtom(clearLoginState);
    
    const closeMenu = useCallback(() => {}, []); 

    // [Access Token 설정]
    useEffect(() => {
        if (accessToken?.length > 0) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [accessToken]);

    // [로그아웃(logout)]
    const logout = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();

        clearLogin(); // jotai state 초기화
        delete axios.defaults.headers.common["Authorization"]; // axios 헤더 제거

        navigate("/"); // 메인페이지로 이동 
        closeMenu(); // 💡 closeMenu 제거
    }, [clearLogin, navigate]);


    return (
        <header className="fixed-top bg-white border-bottom" style={{ zIndex: 1040 }}>
            
            {/* 1. 로고 + 검색창 + 기타 정보 영역 */}
            <div className="container-fluid py-1 d-flex justify-content-between align-items-center">
                
                {/* 로고 영역 */}
                <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center ms-2" to="/">
                    <img
                        src={logo2}
                        style={{ width: '40px', height: '40px', marginRight: '20px' }}
                        alt="bidHouse Logo"
                    />
                    <span className="text-black">bidHouse</span>
                </Link>

                {/* 검색창 영역 */}
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

                {/* 2. 💡 오른쪽 유틸리티 링크 및 알림 영역 (정리 및 재배치) */}
                <div className="d-none d-lg-flex align-items-center fs-6 me-2"> {/* fs-6으로 폰트 크기 조정 */}
                    
                    {/* 알림 종 아이콘 */}
                    <FaRegBell className="me-5 fs-5 text-black" style={{ cursor: 'pointer' }} /> 
                    {/* 알림 개수 추가예정 */}
                    
                    {/* 로그인 상태에 따른 조건부 렌더링 */}
                    {isLogin ? (
                        <div className='d-flex align-items-center'> 
                            {/* 로그인 상태: ID, 마이페이지, 로그아웃, 관리자 */}
                            <Link className="text-success fw-bold text-decoration-none" to="/member/mypage">
                                {loginId} ({loginRole})
                            </Link>
                            <div className="ms-3 me-3">|</div>
                            <Link className="text-dark text-decoration-none" onClick={logout}>
                                로그아웃 
                            </Link>
                            
                            {/* {isAdmin && (
                                <Link className="text-dark me-3 text-decoration-none" to="/admin">
                                    관리자
                                </Link>
                            )} */}
                        </div>
                    ) : (
                        <div className='d-flex align-items-center'>
                            {/* 로그아웃 상태: 로그인, 회원가입 */}
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