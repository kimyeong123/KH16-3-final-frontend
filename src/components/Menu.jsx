// src/components/Menu.js

import { Link, useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './menu.css';
import logo2 from '../assets/logo2.png';
import { useCallback, useEffect, useRef, useState } from "react";
import { FaClipboardList } from "react-icons/fa";
import { MdSupportAgent, MdOutlineDocumentScanner } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import { FaPlusSquare } from "react-icons/fa";
import { useAtom, useSetAtom } from "jotai";
import axios from "axios";
import Swal from "sweetalert2";
import { FaMoneyBillTransfer } from "react-icons/fa6";

import { loginIdState, loginRoleState, loginNicknameState, accessTokenState, loginCompleteState, loginState, adminState, clearLoginState, loginNoState } from "../utils/jotai";
import { FaReceipt } from "react-icons/fa6";
import { FaListUl } from "react-icons/fa";


export default function Menu() {
    const navigate = useNavigate();

    // jotai state
    const [loginNo] = useAtom(loginNoState);
    const [loginId] = useAtom(loginIdState);
    const [loginRole] = useAtom(loginRoleState);
    const [accessToken] = useAtom(accessTokenState);
    const [, setLoginComplete] = useAtom(loginCompleteState);
    const [loginNickname] = useAtom(loginNicknameState);

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
        setLoginComplete(true);
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
        <nav className="navbar navbar-expand-lg" data-bs-type="light">
            <div className="container-fluid">

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
                        <Link className="nav-link fs-6" to="/product/auction/list" onClick={closeMenu}>
                            <RiAuctionLine className="fs-3 me-1" />경매
                        </Link>
                        <li className="nav-item">
                            <Link className="nav-link fs-6" to="/auction" onClick={closeMenu}><RiAuctionLine className="fs-3 me-1" />대충 카테고리</Link>
                        </li>
                    </ul>

                    {/* 우측 메뉴 (단일 ul 태그로 간결화) */}
                    <ul className="navbar-nav ms-auto ms-3">
                        <li className="nav-item">
                            <Link className="nav-link fs-6 me-2" to="/board/list" onClick={closeMenu}><FaClipboardList className="fs-5 me-1" />공지사항</Link>
                        </li>


                        {/* 로그인 상태에 따른 조건부 렌더링 */}
                        {isLogin ? (
                            <>
                                {/* 로그인 상태: 로그아웃 버튼 */}
                                 <li className="nav-item">
                                    <Link className="nav-link fs-6" to="/pay/kakaopay" onClick={closeMenu}>
                                        <FaMoneyBillTransfer className="fs-5 me-1" />
                                        포인트 충전
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link fs-6" to="/product/productadd" onClick={closeMenu}>
                                        <FaPlusSquare className="fs-5 me-1" />
                                        물품 등록
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        className="nav-link fs-6 me-2"
                                        to="/product/mylist"
                                        onClick={closeMenu}
                                    >
                                        <FaListUl className="fs-5 me-1" />
                                        내상품리스트
                                    </Link>
                                </li>

                                {/* 관리자 메뉴 */}
                                {isAdmin && (
                                    <li className="nav-item">
                                        <Link className="nav-link fs-6" to="/admin/home" onClick={closeMenu}>관리자</Link>
                                    </li>
                                )}
                            </>
                        ) : (
                            <>
                                {/* 로그아웃 상태: 회원가입 버튼 */}

                            </>
                        )}
                    </ul>
                </div>

            </div>
        </nav>
    );
}