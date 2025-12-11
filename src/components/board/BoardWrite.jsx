import { useCallback, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FaPlus } from "react-icons/fa6";

export default function BoardWrite() {

    // 이동 도구
    const navigate = useNavigate();

    // ***** 1. 상태(State) *****
    const [board, setBoard] = useState({
        title: "",
        content: "", 
    });
    const [attachment, setAttachment] = useState([]); 
    
    // ***** 2. 콜백(Callback) *****
    
    // [1] 텍스트 입력값 변경 핸들러
    const handleTextChange = useCallback((e)=>{
        setBoard(prevBoard => ({
            ...prevBoard,
            [e.target.name]: e.target.value
        }));
    }, []);

    // [2] 첨부 파일 변경 핸들러
    const handleFileChange = useCallback((e)=> {
        setAttachment(Array.from(e.target.files)); 
    }, []);

    // [3] 데이터 전송 핸들러 (버튼 onClick에 연결)
    const handleSubmit = useCallback(async ()=> {
        
        // 유효성 검사
        if(board.title.trim() === '' || board.content.trim() === '') {
            toast.error("제목과 내용을 모두 입력하세요");
            return;
        }

        // --- 데이터 전송 준비: FormData 사용 ---
        const formData = new FormData();

        formData.append("title", board.title);
        formData.append("content", board.content);
        
        attachment.forEach((file)=>{ 
            formData.append("attachment", file);
        });

        try {
            // axios를 사용하여 비동기로 데이터 전송
            const response = await axios.post("/board/write", formData);

            if(response.status === 200) {
                toast.success("작성이 완료되었습니다");
                navigate("/board/list");
            }
        } catch (error) {
            console.error("공지작성 실패: ", error);
            toast.error("작성 실패");
        }
    }, [board, attachment, navigate]); 

    
    // ***** 3. 렌더링(Render) *****
    return (<>
    
        <Jumbotron subject="공지 작성" detail=""/>

        <div className="container p-5">
            {/* 💡 Form 태그 대신 div만 사용 */}
            <div>
                    
                {/* 1. 제목 입력 */}
                <div className="row mt-4">
                    <label htmlFor="boardTitle" className="col-sm-3 col-form-label">제목</label>
                    <div className="col-sm-9">
                        <input
                            type="text"
                            className="form-control"
                            id="boardTitle"
                            name="title" 
                            value={board.title}
                            onChange={handleTextChange} 
                            required
                        />
                    </div>
                </div>

                {/* 2. 내용 입력 */}
                <div className="row mt-4">
                    <label htmlFor="boardContent" className="col-sm-3 col-form-label">내용</label>
                    <div className="col-sm-9">
                        <textarea
                            className="form-control"
                            id="boardContent"
                            name="content" 
                            rows="10"
                            value={board.content}
                            onChange={handleTextChange} 
                            required
                        ></textarea>
                    </div>
                </div>
                
                {/* 3. 첨부파일 입력 */}
                <div className="row mt-4">
                    <label htmlFor="boardAttachments" className="col-sm-3 col-form-label">첨부 파일</label>
                    <div className="col-sm-9">
                        <input
                            type="file"
                            className="form-control"
                            id="boardAttachments"
                            onChange={handleFileChange} 
                            multiple 
                        />
                        {attachment.length > 0 && ( 
                            <small className="form-text text-muted mt-2">
                                선택된 파일 ({attachment.length}개): {attachment.map(f => f.name).join(', ')}
                            </small>
                        )}
                    </div>
                </div>

                {/* 4. 버튼 영역 */}
                <div className="row mt-4">
                    <div className="col text-end">
                        <button 
                            type="button" 
                            className="btn btn-primary btn-lg me-2" 
                            onClick={handleSubmit} 
                        >
                            <FaPlus className="me-2"/> 작성 완료
                        </button>
                        <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate("/board/list")}>취소</button>
                    </div>
                </div>
            </div>
        </div>
    </>)
}