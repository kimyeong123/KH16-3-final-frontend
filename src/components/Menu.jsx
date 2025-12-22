// src/components/Menu.js
import { Link, useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './menu.css';
import logo2 from '../assets/logo2.png';
import { useCallback, useEffect, useRef, useState } from "react";
import { FaClipboardList, FaPlusSquare, FaListUl, FaWallet, FaEnvelope } from "react-icons/fa";
import { useAtom, useSetAtom } from "jotai";
import axios from "axios";
import { FaCashRegister, FaScrewdriverWrench } from "react-icons/fa6";
import { loginIdState, loginRoleState, loginNicknameState, accessTokenState, loginCompleteState, loginState, adminState, clearLoginState, loginNoState, loginPointState } from "../utils/jotai";
import { RiAuctionLine } from "react-icons/ri";

export default function Menu() {
    const navigate = useNavigate();

    const [loginNo] = useAtom(loginNoState);
    const [loginId] = useAtom(loginIdState);
    const [loginRole] = useAtom(loginRoleState);
    const [accessToken] = useAtom(accessTokenState);
    const [, setLoginComplete] = useAtom(loginCompleteState);
    const [loginNickname] = useAtom(loginNicknameState);
    const [isLogin] = useAtom(loginState);
    const [isAdmin] = useAtom(adminState);
    const clearLogin = useSetAtom(clearLoginState);
    const [loginPoint, setLoginPoint] = useAtom(loginPointState);

    // 정지 회원 여부 체크
    const isSuspended = loginRole === "SUSPENDED";

    useEffect(() => {
        if (accessToken?.length > 0) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [accessToken]);

    const loadPoint = useCallback(async () => {
        if (!isLogin || !accessToken) return;
        try {
            const response = await axios.get("/member/point/balance", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const pointValue = (response.data && typeof response.data === 'object') 
                                ? response.data.point 
                                : response.data;
            setLoginPoint(Number(pointValue ?? 0)); 
        } catch (error) {}
    }, [isLogin, accessToken, setLoginPoint]);

    useEffect(() => {
        if (isLogin && accessToken) {
            loadPoint();
        }
    }, [isLogin, accessToken, loadPoint]);

    const logout = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        clearLogin();
        setLoginComplete(true);
        delete axios.defaults.headers.common["Authorization"];
        navigate("/");
        closeMenu();
    }, [clearLogin, navigate]);

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
                <div className={`collapse navbar-collapse ${open && 'show'}`} id="menu-body" ref={menuRef}>

                    <ul className="navbar-nav me-auto ms-3">
                        <Link className="nav-link fs-6" to="/product/auction/list" onClick={closeMenu}>
                            <RiAuctionLine className="fs-3 me-1" />전체 경매
                        </Link>
                    </ul>

                    <ul className="navbar-nav ms-auto ms-3 align-items-center">
                        <li className="nav-item">
                            <Link className="nav-link fs-6 me-2" to="/board/list" onClick={closeMenu}>
                                <FaClipboardList className="fs-5 me-1" />공지사항
                            </Link>
                        </li>

                        {isLogin && (
                            <>
                                {/* 정지 회원이 아닐 때만 물품 등록 및 포인트 충전 노출 */}
                                {!isSuspended && (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link fs-6 me-2" to="/product/productadd" onClick={closeMenu}>
                                                <FaPlusSquare className="fs-5 me-1" />물품 등록
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link fs-6 me-2" to="/pay/kakaopay" onClick={closeMenu}>
                                                <FaCashRegister className="fs-5 me-1" />포인트 충전
                                            </Link>
                                        </li>
                                    </>
                                )}
                                
                                <li className="nav-item">
                                    <Link className="nav-link fs-6 me-2" to="/product/mylist" onClick={closeMenu}>
                                        <FaListUl className="fs-5 me-1" />거래내역
                                    </Link>
                                </li>

                                {isAdmin && (
                                    <li className="nav-item">
                                        <Link className="nav-link fs-6" to="/admin/home" onClick={closeMenu}>
                                            <FaScrewdriverWrench className="fs-5 me-1" />관리 메뉴
                                        </Link>
                                    </li>
                                )}

                                <li className="nav-item me-3">
                                    <div className="point-badge d-flex align-items-center"
                                        onClick={() => { navigate("/pay/kakaopay"); closeMenu(); }}
                                        style={{ cursor: 'pointer' }}>
                                        <FaWallet className="icon-wallet" />
                                        <div className="point-content">
                                            <span className="point-label">MY POINT</span>
                                            <span className="point-amount">{Number(loginPoint ?? 0).toLocaleString()} P</span>
                                        </div>
                                    </div>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}