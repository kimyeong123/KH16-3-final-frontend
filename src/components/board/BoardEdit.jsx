import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function BoardEdit() {
    // URL에서 boardNo 가져오기 (예: /board/edit/10)
    const { boardNo } = useParams(); 
    const navigate = useNavigate();
    
    // 상태 정의
    const [board, setBoard] = useState({
        title: '',
        content: '',
        type: '',
    });
    const [loading, setLoading] = useState(true);
    
    const [attachments, setAttachments] = useState([]); 

    // [1] 기존 게시물 정보 불러오기 (마운트 시)
    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const response = await axios.get(`/board/${boardNo}`); 
                setBoard(response.data);
                // TODO: 기존 첨부파일 목록도 응답에 포함되어 있다면, 별도 상태로 저장하는 로직 필요
            } catch (error) {
                console.error("게시물 로드 실패:", error);
                toast.error("게시물을 불러오는데 실패했습니다.");
                navigate('/board/list'); 
            } finally {
                setLoading(false);
            }
        };
        fetchBoard();
    }, [boardNo, navigate]); 

    // 입력 필드 변경 핸들러 (제목, 내용 등)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBoard(prevBoard => ({
            ...prevBoard,
            [name]: value,
        }));
    };

    // 첨부 파일 변경 핸들러
    const handleFileChange = (e) => {
        // 새로 선택된 파일들을 attachments 상태에 저장
        setAttachments(Array.from(e.target.files));
    };

    // [2] 수정 요청 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 필수 필드 유효성 검사
        if (!board.title || !board.content) {
            toast.warn("제목과 내용을 모두 입력해 주세요.");
            return;
        }

        // 💡 [수정 시작] FormData 생성 및 데이터 삽입
        const formData = new FormData();
        
        // 1. DTO 데이터 준비 및 JSON 문자열로 변환
        const boardDtoData = {
            title: board.title,
            content: board.content,
            type: board.type,
            // 기타 DTO 필드가 있다면 여기에 추가
        };
        const boardDataJson = JSON.stringify(boardDtoData);
        
        // 2. [핵심 수정] JSON 데이터를 'boardDto'라는 이름의 파트로 추가
        // 서버의 @RequestPart BoardDto boardDto에 정확히 매핑됩니다.
        formData.append(
            'boardDto', 
            new Blob([boardDataJson], { type: 'application/json' })
        ); 

        // 3. 파일 데이터 추가: 백엔드의 @RequestPart List<MultipartFile> attach 이름과 일치
        attachments.forEach((file) => {
            formData.append('attach', file); 
        });
        // 💡 [수정 끝]

        try {
            await axios.patch(`/board/edit/${boardNo}`, formData); 
            
            toast.success("게시물이 성공적으로 수정되었습니다.");
            navigate(`/board/${boardNo}`); 
        } catch (error) {
            console.error("게시물 수정 실패:", error);
            const errorMessage = error.response?.data?.message || "게시물 수정에 실패했습니다.";
            toast.error(errorMessage);
        }
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    // [3] 렌더링
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <h2>게시물 수정</h2>
                    <form onSubmit={handleSubmit}>
                        
                        {/* 유형 (Type) 표시 */}
                        <div className="mb-3">
                            <label className="form-label">게시판 유형</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={board.type || ''} 
                                readOnly 
                            />
                        </div>
                        
                        {/* 제목 입력 */}
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">제목</label>
                            <input
                                type="text"
                                className="form-control"
                                id="title"
                                name="title"
                                value={board.title || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* 내용 입력 */}
                        <div className="mb-3">
                            <label htmlFor="content" className="form-label">내용</label>
                            <textarea
                                className="form-control"
                                id="content"
                                name="content"
                                rows="10"
                                value={board.content || ''}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        
                        {/* 첨부 파일 입력 필드 추가 */}
                        <div className="mb-3">
                            <label htmlFor="attachments" className="form-label">첨부 파일 추가/변경</label>
                            <input
                                type="file"
                                className="form-control"
                                id="attachments"
                                name="attachments"
                                multiple // 여러 파일 선택 가능
                                onChange={handleFileChange} 
                            />
                            <small className="form-text text-muted">새로 선택된 파일은 서버로 전송됩니다.</small>
                        </div>

                        {/* TODO: 기존 파일 목록 표시 및 삭제 기능은 이 영역에 추가해야 함 */}

                        {/* 버튼 그룹 */}
                        <div className="d-flex justify-content-end">
                            <button 
                                type="button" 
                                className="btn btn-secondary me-2"
                                onClick={() => navigate(`/board/${boardNo}`)}
                            >
                                취소
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                            >
                                수정 완료
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}