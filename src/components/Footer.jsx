import '@fortawesome/fontawesome-free/css/all.min.css';
import './Footer.css';
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <div className='footer-container'>
            <div className="container py-4">
                <div className="row">

                    {/* 왼쪽 영역 60% */}
                    <div className="col-md-7 mb-3 text-start">
                        <h3 className="footer-title">비드하우스</h3>
                        <br />
                        <p className="footer-text mb-1 fs-6">OO시 OO구 OO동 000-000번지</p>
                        <p className="footer-text mb-1 fs-5">대표이사 : 상혁씨</p>
                        <p className="footer-text mb-0 mt-2">TEL : (02) 1234-5678</p>
                        <p className='footer-text mb-0'>Fax: 01-234-5678</p>
                        <p className='footer-text mb-1'>Email: master@kobay.co.kr</p>
                        <br />
                        <p className="footer-text small mt-2">
                            (주)비드하우스는 통신판매중개자로서 매도인인 경우를 제외하고<br />
                            사이트 상에 등록된 모든 상품과 그 내용에 대하여 책임을 지지 않습니다.
                            <br /><br /><br />
                            Copyright© 2025, kobayauction, Inc All rights reserved.
                        </p>
                    </div>

                    {/* 오른쪽 영역 40% */}
                    <div className="col-md-5 mb-3 text-start">
                        <h5 className="footer-title">고객센터 & 운영 방침</h5>
                        <ul className="list-unstyled">
                            <li><a href="/qna/main" className="footer-text text-decoration-none d-block py-1"><i className="fa-regular fa-circle-question me-3"></i>문의하기</a></li>
                            <li><a href="https://open.kakao.com/o/siq6ZY6h" target="_blank" rel="noopener noreferrer" className="footer-text text-decoration-none d-block py-1"><i className="fa-brands fa-kakao-talk me-3"></i>카카오톡 상담</a></li>
                            <li>
                                <Link
                                    to="/etc/terms"
                                    className="footer-text text-decoration-none d-block py-1"
                                >
                                    <i className="fa-regular fa-clipboard me-2"></i>
                                    홈페이지 이용약관
                                </Link>
                            </li>

                            <li><a href="/etc/privacy" className="footer-text text-decoration-none d-block py-1">
                                <i className="fa-solid fa-user-lock me-2"></i> 개인정보 처리방침
                            </a></li>
                        </ul>

                        <h5 className="footer-title mt-3">파트너십</h5>
                        <div className="d-flex justify-content-start align-items-center flex-wrap mt-2">
                            <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-google fa-2x google-icon me-3"></i>
                            </a>
                            <a href="https://line.me" target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-line fa-2x me-3" style={{ color: "#00C300" }}></i>
                            </a>
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-facebook fa-2x facebook-icon me-3"></i>
                            </a>
                            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-instagram fa-2x instagram-icon me-3"></i>
                            </a>
                            <a href="https://www.kakaocorp.com" target="_blank" rel="noopener noreferrer" className="kakao-icon-link me-3">
                                <i className="fa-brands fa-kakao-talk fa-2x kakaotalk-icon"></i>
                            </a>
                            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-youtube fa-2x youtube-icon"></i>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
