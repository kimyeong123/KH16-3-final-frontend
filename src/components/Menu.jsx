import { Link } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './menu.css';
import logo2 from '../assets/logo2.png'; 

export default function Menu() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" data-bs-type="light">
            <div className="container">

                <Link className="navbar-brand fw-bold fs-3 d-flex align-items-center" to="/">
                    <img
                        src={logo2} 
                        style={{ width: '80px', height: '80px', marginRight: '20px' }} // 크기와 간격 조정
                    />
                    bidHouse
                </Link>


                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* 메뉴 항목 */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/auction">경매</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about">소개</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/contact">문의</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/login">로그인</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
