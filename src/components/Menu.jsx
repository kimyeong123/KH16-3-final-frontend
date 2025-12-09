import { Link, useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './menu.css';
import logo2 from '../assets/logo2.png';
import { useCallback, useEffect, useRef, useState } from "react";
import { RiLoginBoxFill, RiLogoutBoxFill } from "react-icons/ri";
import { MdSupportAgent, MdOutlineDocumentScanner } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import axios from "axios";
import { loginIdState, loginRoleState, accessTokenState, loginCompleteState, loginState, adminState, clearLoginState } from "../utils/jotai";


export default function Menu() {
    const navigate = useNavigate();

    // jotai state
    const [loginId] = useAtom(loginIdState);
    const [loginRole] = useAtom(loginRoleState);
    const [accessToken] = useAtom(accessTokenState);
    const [, setLoginComplete] = useAtom(loginCompleteState);

    // jotai selector
    const [isLogin] = useAtom(loginState);
    const [isAdmin] = useAtom(adminState);


    // jotai 초기화 함수 (쓰기 전용)
    const clearLogin = useSetAtom(clearLoginState);

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
        closeMenu();
    }, [clearLogin, navigate]);


    // [메뉴 제어]
    const [open, setOpen] = useState(false);
    const toggleMenu = useCallback(() => { setOpen(prev => !prev); }, []);
    const closeMenu = useCallback(() => { setOpen(false) }, []);
    const menuRef = useRef();


    useEffect(() => {
        const listener = e => {
            if (open && menuRef.current && !menuRef.current.contains(e.target)) {
                closeMenu();
            }
        };
        window.addEventListener("mousedown", listener);
        return () => window.removeEventListener("mousedown", listener);
    }, [open, closeMenu]);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" data-bs-type="light">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/">
                    <img
                        src={logo2}
                        style={{ width: '80px', height: '80px', marginRight: '20px' }}
                    />
                    bidHouse
                </Link>

                <button className="navbar-toggler" type="button"
                    aria-controls="menu-body" aria-expanded={open} aria-label="Toggle navigation" onClick={toggleMenu}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div
                    className={`collapse navbar-collapse ${open && 'show'}`}
                    id="menu-body"
                    ref={menuRef}
                >
                    {/* 좌측 메뉴 */}
                    <ul className="navbar-nav me-auto ms-3">
                        <li className="nav-item">
                            <Link className="nav-link fs-4" to="/auction" onClick={closeMenu}><RiAuctionLine className="fs-3 me-1" />경매</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fs-4" to="/about" onClick={closeMenu}>커뮤니티</Link>
                        </li>
                    </ul>

                    {/* 우측 메뉴 (단일 ul 태그로 간결화) */}
                    <ul className="navbar-nav ms-auto ms-3">
                        {/* 공통 메뉴 */}
                        <li className="nav-item">
                            <Link className="nav-link fs-6" to="/contact" onClick={closeMenu}><MdOutlineDocumentScanner className="fs-5 me-1" />이용가이드</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fs-6" to="#" onClick={closeMenu}><MdSupportAgent className="fs-5 me-1" />문의사항</Link>
                        </li>

                        {/* 로그인 상태에 따른 조건부 렌더링 */}
                        {isLogin ? (
                            <>
                                {/* 로그인 상태: ID 및 Role 표시 */}
                                <li className="nav-item">
                                    <Link className="nav-link fs-6 fw-bold text-success" to="/member/mypage" onClick={closeMenu}>
                                        {loginId}님 ({loginRole})
                                    </Link>
                                </li>

                                {/* 로그인 상태: 로그아웃 버튼 */}
                                <li className="nav-item">
                                    <Link className="nav-link fs-6" onClick={logout}>
                                        <RiLogoutBoxFill className="fs-4 me-1" />
                                        로그아웃
                                    </Link>
                                </li>

                                {/* 관리자 메뉴 */}
                                {isAdmin && (
                                    <li className="nav-item">
                                        <Link className="nav-link fs-6" to="/admin" onClick={closeMenu}>관리자</Link>
                                    </li>
                                )}
                            </>
                        ) : (
                            <>
                                {/* 로그아웃 상태: 로그인 버튼 */}
                                <li className="nav-item">
                                    <Link className="nav-link fs-6" to="/member/login" onClick={closeMenu}>
                                        <RiLoginBoxFill className="fs-4 me-1" />
                                        로그인
                                    </Link>
                                </li>
                                {/* 로그아웃 상태: 회원가입 버튼 */}
                                <li className="nav-item">
                                    <Link className="nav-link fs-6" to="/member/join" onClick={closeMenu}>
                                        <i className="fa-solid fa-user-plus me-2"></i>
                                        회원가입
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

            </div>
        </nav>
    );
}