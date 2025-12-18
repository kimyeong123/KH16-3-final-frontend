import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAtomValue } from "jotai";
import { adminState, loginNoState } from "../../utils/jotai";
import CommentSection from "../comment/CommentSection";

const QnaDetail = () => {
    const { boardNo } = useParams();
    const navigate = useNavigate();

    const isAdmin = useAtomValue(adminState);
    const loginNo = useAtomValue(loginNoState);

    const [board, setBoard] = useState(null);
    const [comments, setComments] = useState([]);

    const loadData = useCallback(async () => {
        const token = localStorage.getItem("accessTokenState");
        if (!token || token === "null") return;

        try {
            const boardResp = await axios.get(`/qna/detail/${boardNo}`);
            setBoard(boardResp.data);

            const commentResp = await axios.get(`/comment/list/${boardNo}`);
            setComments(commentResp.data);
        } catch (error) {
            console.error("데이터 로드 중 오류 발생", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert("권한이 없습니다.");
                navigate("/qna/main");
            }
        }
    }, [boardNo, navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const deleteBoard = async () => {
        if (!window.confirm("정말 이 문의글을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`/qna/${boardNo}`);
            alert("문의글이 삭제되었습니다.");
            navigate("/qna/main");
        } catch (error) {
            alert(error.response?.data?.message || "삭제 권한이 없습니다.");
        }
    };

    if (!board) return <div className="p-5 text-center">데이터를 불러오는 중입니다...</div>;

    return (
        <div className="container mt-5">
            {/* 상단 헤더 섹션 - 중앙 정렬 적용 */}
            <div className="row mb-4">
                <div className="col-md-8 offset-md-2 text-center border-bottom pb-4">
                    <span className="badge bg-dark mb-2">{board.type}</span>
                    <h1 className="fw-bold display-5 mb-3">{board.title}</h1>
                    <div className="text-muted">
                        <span>작성자 번호: {board.writerNo}</span>
                        <span className="mx-2">|</span>
                        <span>작성일: {board.writeTime ? new Date(board.writeTime).toLocaleString() : '정보 없음'}</span>
                    </div>
                </div>
            </div>

            {/* 본문 섹션 - 가독성을 위해 너비 조절 */}
            <div className="row mb-4">
                <div className="col-md-8 offset-md-2">
                    <div className="p-5 bg-white border rounded shadow-sm" style={{ minHeight: "300px" }}>
                        <div dangerouslySetInnerHTML={{ __html: board.content }} />
                    </div>

                    {/* 버튼 영역 - 본문 바로 아래 우측 정렬 */}
                    <div className="text-end mt-3">
                        {(isAdmin || loginNo == board.writerNo) && (
                            <button className="btn btn-outline-danger me-2" onClick={deleteBoard}>
                                삭제하기
                            </button>
                        )}
                        <button className="btn btn-outline-secondary" onClick={() => navigate("/qna/main")}>
                            목록으로
                        </button>
                    </div>
                </div>
                {/* 답변(댓글) 섹션 - 본문과 너비 맞춤 */}
                <div className="row mb-5">
                    <div className="col-md-8 offset-md-2">
                        <CommentSection
                            boardNo={boardNo}
                            comments={comments}
                            isAdmin={isAdmin}
                            loginNo={loginNo}
                            onRefresh={loadData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QnaDetail;