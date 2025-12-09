import { Link, useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './menu.css';
import logo2 from '../assets/logo2.png';
import { useCallback, useEffect, useRef, useState } from "react";

export default function Menu() {
    const navigate = useNavigate();

    //jotai state



    const [open, setOpen] = useState(false);
    const toggleMenu = useCallback(() => { setOpen(prev => !prev); }, []);

    const closeMenu = useCallback(() => { setOpen(false) }, []);
    const menuRef = useRef();///메뉴 영역을 선택해둘 리모컨

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
                <Link className="navbar-brand fw-bold fs-3 d-flex align-items-center" to="/">
                    <img
                        src={logo2}
                        style={{ width: '80px', height: '80px', marginRight: '20px' }}
                    />
                    bidHouse
                </Link>


                <button className="navbar-toggler" type="button"
                    aria-controls="menu-body" aria-expanded="false" aria-label="Toggle navigation" onClick={toggleMenu}>
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
                            <Link className="nav-link" to="/auction" onClick={closeMenu}>경매</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about" onClick={closeMenu}>커뮤니티</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/contact" onClick={closeMenu}>이용가이드</Link>
                        </li>
                    </ul>

                    {/* 우측 메뉴 */}
                    <ul className="navbar-nav ms-auto ms-3">
                        <li className="nav-item">
                            <Link className="nav-link" to="#" onClick={closeMenu}>문의사항</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link me-2" to="/member/login" onClick={closeMenu}>
                                <span className="d-flex align-items-center">
                                    로그인
                                </span>
                            </Link>
                        </li>
                    </ul>
                </div>

            </div>
        </nav>
    );
}
