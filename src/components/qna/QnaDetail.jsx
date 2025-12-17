import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function QnaDetail() {
    const { boardNo } = useParams();
    const navigate = useNavigate();
    const [qna, setQna] = useState(null);

    useEffect(() => {
        // 상세 데이터 로드 (게시글 + 첨부파일 리스트가 같이 들어옴)
        axios.get(`/qna/${boardNo}`).then(resp => {
            setQna(resp.data);
        });
    }, [boardNo]);

    if (!qna) return <div>로딩 중...</div>;

    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h3 className="fw-bold">{qna.title}</h3>
                    <div className="text-muted small">
                        작성자: {qna.writerNickname} | 작성일: {new Date(qna.writeTime).toLocaleString()}
                    </div>
                </div>
                <div className="card-body" style={{ minHeight: '300px' }}>
                    {/* 본문 내용 */}
                    <div className="mb-4">{qna.content}</div>
                    
                    {/* 첨부 이미지 (아까 해결한 로직 적용) */}
                    {qna.attachmentList && qna.attachmentList.map(file => (
                        <img key={file.attachmentNo} 
                             src={`/attachment/${file.attachmentNo}`} 
                             alt="첨부이미지" className="img-fluid mb-2 rounded" />
                    ))}
                </div>
            </div>

            {/* 답변(댓글) 영역 - 여기가 핵심 */}
            <div className="mt-4">
                <h5><i className="fa-solid fa-comment-dots me-2"></i>답변 내역</h5>
                <hr/>
                {/* 댓글 리스트 컴포넌트를 여기에 넣거나 직접 렌더링 */}
                {/* 댓글이 없으면 "답변 대기 중입니다" 표시 */}
            </div>

            <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>목록으로</button>
        </div>
    );
}