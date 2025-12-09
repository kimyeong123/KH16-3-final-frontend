import { Link, useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './menu.css';
import logo2 from '../assets/logo2.png';
import { useCallback, useEffect, useRef, useState } from "react";
import { RiLoginBoxFill } from "react-icons/ri";
import { MdSupportAgent } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import { MdOutlineDocumentScanner } from "react-icons/md";

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
                <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/">
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
                            <Link className="nav-link fs-4" to="/auction" onClick={closeMenu}><RiAuctionLine className="fs-3 me-1" />경매</Link>
                        </li>
                    </ul>

                    {/* 우측 메뉴 */}
                    <ul className="navbar-nav ms-auto ms-3">
                           <li className="nav-item">
                            <Link className="nav-link fs-6" to="/board" onClick={closeMenu}><MdOutlineDocumentScanner className="fs-5 me-1"/>공지사항</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fs-6" to="#" onClick={closeMenu}><MdSupportAgent className="fs-5 me-1" />문의하기</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fs-6" to="/member/login" onClick={closeMenu}>
                            <RiLoginBoxFill  className="fs-4 me-1"/>
                                    로그인
                            </Link>
                        </li>
                    </ul>
                </div>

            </div>
        </nav>
    );
}
