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
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top" style={{zIndex: 10}}>
        <div className="container-fluid">
            {/* 1. 메뉴 버튼: 항상 왼쪽 정렬 */}
            <button className="navbar-toggler" type="button"
                onClick={toggleMenu} aria-expanded={open}>
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="menu-body" ref={menuRef}>
                
                {/* 2. 왼쪽 메뉴 영역 (전체 경매) */}
                <ul className="navbar-nav me-auto mb-lg-0 align-items-center">
                    <li className="nav-item">
                        {/* justify-content-center를 추가하여 모바일에서도 아이콘-글자가 묶여서 중앙으로 오게 함 */}
                        <Link className="nav-link d-flex align-items-center justify-content-center py-2 py-lg-0" to="/product/auction/list" onClick={closeMenu}>
                            {/* 아이콘의 미세한 위치 조정을 위해 mb-1 또는 vertical-align 사용 */}
                            <RiAuctionLine className="fs-3 me-2 text-primary" style={{ verticalAlign: 'middle' }} />
                            <span style={{ lineHeight: '1' }}>전체 경매</span>
                        </Link>
                    </li>
                </ul>

                {/* 3. 오른쪽 메뉴 영역 */}
                <ul className="navbar-nav ms-auto align-items-center gap-lg-1">
                    <li className="nav-item">
                        <Link className="nav-link d-flex align-items-center justify-content-center py-2 py-lg-0" to="/board/list" onClick={closeMenu}>
                            <FaClipboardList className="me-2" />
                            <span style={{ lineHeight: '1' }}>공지사항</span>
                        </Link>
                    </li>

                    {isLogin && (
                        <>
                            {!isSuspended && (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link d-flex align-items-center justify-content-center py-2 py-lg-0" to="/product/productadd" onClick={closeMenu}>
                                            <FaPlusSquare className="me-2" />
                                            <span style={{ lineHeight: '1' }}>물품 등록</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link d-flex align-items-center justify-content-center py-2 py-lg-0" to="/pay/kakaopay" onClick={closeMenu}>
                                            <FaCashRegister className="me-2" />
                                            <span style={{ lineHeight: '1' }}>포인트 충전</span>
                                        </Link>
                                    </li>
                                </>
                            )}
                            
                            <li className="nav-item">
                                <Link className="nav-link d-flex align-items-center justify-content-center py-2 py-lg-0" to="/product/mylist" onClick={closeMenu}>
                                    <FaListUl className="me-2" />
                                    <span style={{ lineHeight: '1' }}>거래내역</span>
                                </Link>
                            </li>

                            {isAdmin && (
                                <li className="nav-item">
                                    <Link className="nav-link d-flex align-items-center justify-content-center py-2 py-lg-0 text-danger" to="/admin/home" onClick={closeMenu}>
                                        <FaScrewdriverWrench className="me-2" />
                                        <span style={{ lineHeight: '1' }}>관리 메뉴</span>
                                    </Link>
                                </li>
                            )}

                            {/* 포인트 배지: 디자인 통일 */}
                            <li className="nav-item ms-lg-2 my-2 my-lg-0">
                                <div className="point-badge d-inline-flex align-items-center"
                                     onClick={() => { navigate("/pay/kakaopay"); closeMenu(); }}
                                     style={{ cursor: 'pointer', background: '#f8f9fa', borderRadius: '25px', padding: '5px 15px', border: '1px solid #eee' }}>
                                    <FaWallet className="text-warning me-2" />
                                    <div className="d-flex flex-column text-start" style={{ lineHeight: '1.1' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#888' }}>MY POINT</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{Number(loginPoint ?? 0).toLocaleString()}P</span>
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