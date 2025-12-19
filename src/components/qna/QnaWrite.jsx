import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const QnaWrite = () => {
    const navigate = useNavigate();

    // 1. 상태 정의
    const [board, setBoard] = useState({
        title: "",
        content: "",
        type: "QNA" // 일반 문의 고정
    });
    const [attachments, setAttachments] = useState([]); // 파일 원본
    const [previews, setPreviews] = useState([]); // 미리보기 URL

    // 2. 텍스트 입력 핸들러
    const changeBoard = (e) => {
        setBoard({ ...board, [e.target.name]: e.target.value });
    };

    // 3. 파일 선택 핸들러 (미리보기 포함)
    const changeFile = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(files);

        // 이미지 파일인 경우 미리보기 생성
        const newPreviews = files.map(file => {
            if (file.type.startsWith("image/")) {
                return URL.createObjectURL(file);
            }
            return null; // 이미지가 아니면 null
        });
        setPreviews(newPreviews);
    };

    // 4. 서버 전송 핸들러
    const saveBoard = async () => {
        if (!board.title.trim() || !board.content.trim()) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        const formData = new FormData();
        
        // 컨트롤러의 @RequestPart BoardDto 매핑을 위한 Blob 처리
        const boardBlob = new Blob([JSON.stringify(board)], { type: "application/json" });
        formData.append("boardDto", boardBlob);
        
        // 첨부파일 추가 (없어도 빈 리스트로 전송)
        attachments.forEach(file => {
            formData.append("attachments", file);
        });

        try {
            await axios.post("/qna/write", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("문의가 성공적으로 등록되었습니다.");
            navigate("/qna/main"); // 목록으로 돌아가기
        } catch (error) {
            console.error("등록 실패", error);
            alert("등록 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '800px' }}>
            <h3 className="fw-bold mb-4">1:1 문의하기</h3>
            
            <div className="card shadow-sm p-4">
                <div className="mb-3">
                    <label className="form-label fw-bold">제목</label>
                    <input type="text" name="title" className="form-control" 
                           placeholder="문의 제목을 입력하세요" onChange={changeBoard} />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">문의 내용</label>
                    <textarea name="content" className="form-control" rows="10" 
                              placeholder="내용을 입력하세요" onChange={changeBoard}></textarea>
                </div>

                <div className="mb-4">
                    {/* <label className="form-label fw-bold">파일 첨부 (선택)</label>
                    <input type="file" className="form-control" multiple onChange={changeFile} /> */}
                    
                    {/* 미리보기 영역 */}
                    <div className="d-flex flex-wrap mt-3">
                        {previews.map((url, idx) => url && (
                            <img key={idx} src={url} alt="preview" 
                                 className="rounded border me-2 mb-2" 
                                 style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                        ))}
                    </div>
                </div>

                <div className="d-flex justify-content-center border-top pt-4">
                    <button className="btn btn-outline-secondary px-4 me-2" 
                            onClick={() => navigate(-1)}>취소</button>
                    <button className="btn btn-primary px-5" 
                            onClick={saveBoard}>등록하기</button>
                </div>
            </div>
        </div>
    );
};

export default QnaWrite;