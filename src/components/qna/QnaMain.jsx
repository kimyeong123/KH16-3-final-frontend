import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function QnaMain() {
    const [tab, setTab] = useState('faq'); // 현재 보고 있는 탭
    const [faqs, setFaqs] = useState([]);  // FAQ 데이터
    const [myQna, setMyQna] = useState([]); // 내 문의 데이터

    // 1. FAQ 로드 (게시판 형태지만 간단하게)
    const loadFaqs = async () => {
        try {
            // 백엔드에서 PageVO를 반환하므로 .list까지 접근
            const resp = await axios.get("/qna/list", { params: { type: 'FAQ', size: 100 } });
            setFaqs(resp.data.list); // PageVO 안에 list가 있음
        } catch (error) {
            console.error("FAQ 로딩 실패", error);
        }
    };

    // 2. 내 문의 로드
    const loadMyQna = async () => {
        try {
            const resp = await axios.get("/qna/my");
            setMyQna(resp.data.list || []);
        } catch (error) {
            toast.error("내 문의 내역을 가져오지 못했습니다.");
        }
    };

    useEffect(() => {
        if (tab === 'faq') loadFaqs();
        if (tab === 'my') loadMyQna();
    }, [tab]);

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4 fw-bold">고객센터</h2>

            {/* 탭 메뉴 */}
            <div className="btn-group w-100 mb-4 shadow-sm">
                <button className={`btn ${tab === 'faq' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('faq')}>자주 찾는 질문</button>
                <button className={`btn ${tab === 'write' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('write')}>1:1 문의하기</button>
                <button className={`btn ${tab === 'my' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('my')}>내 문의 내역</button>
            </div>

            {/* 탭 내용 */}
            <div className="p-3 border rounded shadow-sm bg-white">

                {/* 1. FAQ (게시판 형태) */}
                {tab === 'faq' && (
                    <div className="accordion" id="faqAccordion">
                        {faqs.map((f, idx) => (
                            <div className="accordion-item" key={f.boardNo}>
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${idx}`}>
                                        [FAQ] {f.title}
                                    </button>
                                </h2>
                                <div id={`collapse${idx}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                    <div className="accordion-body">{f.content}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. 문의하기 (기존 Write 폼 재활용) */}
                {tab === 'write' && (
                    <div className="p-2">
                        <h5>문의하실 내용을 적어주세요</h5>
                        <hr />
                        {/* 여기에 기존 BoardWrite의 내용을 가져다 붙이거나 컴포넌트로 호출 */}
                        <p className="text-muted">문의 등록 페이지로 이동하시겠습니까?</p>
                        <button className="btn btn-primary" onClick={() => window.location.href = '/qna/write'}>작성하러 가기</button>
                    </div>
                )}

                {/* 3. 내 문의 내역 (가장 필요한 기능) */}
                {tab === 'my' && (
                    <table className="table table-hover text-center">
                        <thead>
                            <tr>
                                <th>상태</th>
                                <th>제목</th>
                                <th>날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myQna.map(q => (
                                <tr key={q.boardNo} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/qna/detail/${q.boardNo}`}>
                                    <td>
                                        {q.replyCount > 0 ?
                                            <span className="badge bg-success">답변완료</span> :
                                            <span className="badge bg-secondary">대기중</span>}
                                    </td>
                                    <td className="text-start">{q.title}</td>
                                    <td>{new Date(q.writeTime).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}