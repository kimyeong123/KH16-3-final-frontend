import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { atom, useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";

export default function QnaMain() {
    const [tab, setTab] = useState('faq');
    const [faqs, setFaqs] = useState([]);
    const [myQna, setMyQna] = useState([]);
    const navigate = useNavigate();

    const loadFaqs = async () => {
        try {
            const resp = await axios.get("/qna/list", { params: { type: 'FREE', size: 100 } });
            // // PageVO 구조에 맞춰 list 추출
            setFaqs(resp.data.list || []);
        } catch (error) { console.error("FAQ 로드 실패", error); }
    };

    const loadMyQna = async () => {
        try {
            const resp = await axios.get("/qna/list", { params: { type: 'QNA' } });
            // // PageVO 구조에 맞춰 list 추출
            setMyQna(resp.data.list || []);
        } catch (error) { toast.error("내역 로드 실패"); }
    };

    useEffect(() => {
        if (tab === 'faq') loadFaqs();
        else loadMyQna();
    }, [tab]);

    return (
        <div className="container mt-5" style={{ maxWidth: '900px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">고객센터</h2>
                <button className="btn btn-primary" onClick={() => window.location.href = '/qna/write'}>
                    <i className="fa-solid fa-pen me-2"></i>1:1 문의하기
                </button>
            </div>

            {/* 탭 메뉴 */}
            <div className="d-flex mb-4 border-bottom pb-2">
                <button
                    type="button"
                    className={`btn me-2 ${tab === 'faq' ? 'btn-primary fw-bold' : 'btn-link text-dark text-decoration-none'}`}
                    onClick={() => setTab('faq')}
                >
                    자주 찾는 질문
                </button>
                <button
                    type="button"
                    className={`btn ${tab === 'my' ? 'btn-primary fw-bold' : 'btn-link text-dark text-decoration-none'}`}
                    onClick={() => setTab('my')}
                >
                    내 문의 내역
                </button>
            </div>

            <div className="p-2">
                {tab === 'faq' && (
                    <div className="accordion accordion-flush shadow-sm border rounded" id="faqAccordion">
                        {faqs.map((f, idx) => (
                            <div className="accordion-item" key={f.boardNo}>
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${idx}`}>
                                        <span className="text-primary me-2">Q.</span> {f.title}
                                    </button>
                                </h2>
                                <div id={`collapse${idx}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                    <div className="accordion-body bg-light rounded-bottom">
                                        <div className="d-flex">
                                            <span className="text-danger fw-bold me-2">A.</span>
                                            <div style={{ whiteSpace: 'pre-wrap' }}>{f.content}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {faqs.length === 0 && <div className="text-center py-5">등록된 질문이 없습니다.</div>}
                    </div>
                )}

                {tab === 'my' && (
                    <div className="table-responsive shadow-sm border rounded">
                        <table className="table table-hover mb-0">
                            <thead className="table-light text-center">
                                <tr>
                                    <th style={{ width: '15%' }}>상태</th>
                                    <th>제목</th>
                                    <th style={{ width: '20%' }}>날짜</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myQna.map(q => (
                                    <tr key={q.boardNo} onClick={() => navigate(`/qna/detail/${q.boardNo}`)} style={{ cursor: 'pointer' }}>
                                        <td className="text-center">
                                            {q.commentCount > 0 ? ( 
                                                <span className="badge bg-success">답변완료</span>
                                            ) : (
                                                <span className="badge bg-secondary">답변대기</span>
                                            )}
                                        </td>
                                        <td>{q.title}</td>
                                        <td className="text-center text-muted small">
                                            {new Date(q.writeTime).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {myQna.length === 0 && <tr><td colSpan="3" className="text-center py-5">문의 내역이 없습니다.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-5 p-4 bg-light rounded text-center">
                <p className="mb-2 text-muted">원하시는 답변을 찾지 못하셨나요?</p>
                <p className="small text-secondary">문의를 남겨주시면 담당자가 신속하게 답변해 드립니다.</p>
            </div>
        </div>
    );
}