import { useState } from "react";
import axios from "axios";

// // props: 게시글번호, 댓글배열, 관리자여부, 로그인번호, 갱신함수
const CommentSection = ({ boardNo, comments, isAdmin, loginNo, onRefresh }) => {
    const [replyContent, setReplyContent] = useState("");
    const [loading, setLoading] = useState(false); // // 중복 클릭 방지용 상태

    // // 1. 답변 등록
    const sendReply = async () => {
        if (!replyContent.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }
        setLoading(true);
        try {
            await axios.post("/comment/write", {
                boardNo: boardNo,
                content: replyContent
            });
            setReplyContent("");
            onRefresh();
        } catch (error) {
            alert("답변 등록 실패");
        } finally {
            setLoading(false);
        }
    };

    // // 2. 답변 삭제
    const deleteReply = async (commentNo) => {
        if (!window.confirm("이 답변을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`/comment/delete/${commentNo}`);
            onRefresh();
        } catch (error) {
            alert("삭제 권한이 없습니다.");
        }
    };

    // // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        if(!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="mt-5">
            <h4 className="mb-4">답변 목록 ({comments ? comments.length : 0})</h4>
            
            {/* 목록 렌더링 */}
            {!comments || comments.length === 0 ? (
                <p className="text-muted p-4 border rounded bg-light">등록된 답변이 없습니다.</p>
            ) : (
                comments.map(comment => (
                    <div key={comment.commentNo} className="card mb-3 border-0 shadow-sm">
                        <div className="card-body border rounded">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <span className="fw-bold text-primary">{comment.writerNickname}</span>
                                    <span className="ms-2 text-muted small">
                                        {formatDate(comment.createdTime)}
                                    </span>
                                </div>
                                <div>
                                    {/* // 관리자이거나 작성자 본인일 때만 삭제 버튼 노출 */}
                                    {(isAdmin || (loginNo && String(loginNo) === String(comment.writerNo))) && (
                                        <button 
                                            className="btn btn-sm btn-outline-danger border-0"
                                            onClick={() => deleteReply(comment.commentNo)}
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="mb-0 text-secondary" style={{ whiteSpace: "pre-wrap" }}>
                                {comment.content}
                            </p>
                        </div>
                    </div>
                ))
            )}

            {/* 답변 입력창 (관리자 전용) */}
            {isAdmin && (
                <div className="mt-5 p-4 bg-light border rounded">
                    <label className="form-label fw-bold">관리자 답변 작성</label>
                    <textarea
                        className="form-control mb-3"
                        rows="4"
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        placeholder="문의에 대한 답변을 입력하세요."
                        disabled={loading}
                    />
                    <div className="text-end">
                        <button 
                            className="btn btn-primary px-4" 
                            onClick={sendReply}
                            disabled={loading || !replyContent.trim()}
                        >
                            {loading ? "등록 중..." : "답변 등록"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentSection;