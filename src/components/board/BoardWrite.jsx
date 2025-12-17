// src/components/BoardWrite.jsx

import { useCallback, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FaPlus, FaXmark } from "react-icons/fa6";

export default function BoardWrite() {
    const navigate = useNavigate();

    // ***** 1. 상태(State) *****
    const [board, setBoard] = useState({
        title: "",
        content: "",
    });

    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [previews, setPreviews] = useState([]); // [{file, url}]

    // 이펙트 훅: 파일 상태가 바뀔 때마다 미리보기 URL을 생성/해제 (메모리 누수 방지)
    useEffect(() => {
        const next = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
        setPreviews(next);
        return () => {
            next.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [files]);

    // ***** 2. 콜백(Callback) - 텍스트/파일 핸들러 *****

    // [1] 텍스트 입력값 변경 핸들러
    const handleTextChange = useCallback((e) => {
        setBoard(prevBoard => ({
            ...prevBoard,
            [e.target.name]: e.target.value
        }));
    }, []);

    // [2] 파일 추가 핸들러 (중복 제거 로직 포함)
    const changeFiles = (e) => {
        const list = Array.from(e.target.files || []);
        setFiles((prev) => {
            const merged = [...prev, ...list];
            const uniq = [];
            const seen = new Set();
            for (const f of merged) {
                const key = `${f.name}_${f.size}`;
                if (seen.has(key)) continue;
                seen.add(key);
                uniq.push(f);
            }
            return uniq;
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (idx) => {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const clearFiles = () => {
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // [3] 데이터 전송 핸들러 (백엔드 /board/write 경로에 맞춘 1단계 통합 전송)
    const handleSubmit = useCallback(async () => {
        // 유효성 검사
        if (board.title.trim() === '' || board.content.trim() === '') {
            toast.error("제목과 내용을 입력하세요");
            return;
        }

        // FormData 생성 (백엔드 @ModelAttribute BoardDto 및 @RequestPart attachments 대응)
        const fd = new FormData();
        
        // 텍스트 데이터 추가 (DTO 필드명 일치 필수)
        fd.append("title", board.title);
        fd.append("content", board.content);

        // 파일 데이터 추가 (백엔드 @RequestPart 이름 "attachments"와 일치 필수)
        files.forEach((file) => {
            fd.append("attachments", file); 
        });

        try {
            // 서버 전송 (기존 백엔드 API 경로)
            await axios.post("/board/write", fd);

            toast.success("작성이 완료되었습니다");
            navigate("/board/list");

        } catch (error) {
            console.error("공지작성 실패: ", error.response || error.message || error);
            const errorMessage = error.response?.data?.message || "게시물 작성에 실패했습니다. 서버 로그를 확인하세요.";
            toast.error(errorMessage);
        }
    }, [board, files, navigate]);

    // ***** 3. 렌더링(Render) *****
    return (
        <div className="container p-5">
            <div className="row mt-4">
                <div className="col fs-3 fw-bold text-primary">공지사항 작성</div>
            </div>

            <div className="mt-4">
                {/* 1. 제목 입력 */}
                <div className="row mb-4">
                    <label htmlFor="boardTitle" className="col-sm-3 col-form-label fw-bold">제목</label>
                    <div className="col-sm-9">
                        <input
                            type="text"
                            className="form-control"
                            id="boardTitle"
                            name="title"
                            value={board.title}
                            onChange={handleTextChange}
                            placeholder="제목을 입력하세요"
                            required
                        />
                    </div>
                </div>

                {/* 2. 내용 입력 */}
                <div className="row mb-4">
                    <label htmlFor="boardContent" className="col-sm-3 col-form-label fw-bold">내용</label>
                    <div className="col-sm-9">
                        <textarea
                            className="form-control"
                            id="boardContent"
                            name="content"
                            rows="10"
                            value={board.content}
                            onChange={handleTextChange}
                            placeholder="내용을 입력하세요"
                            required
                        ></textarea>
                    </div>
                </div>

                {/* 3. 첨부파일 입력 */}
                <div className="row mb-4">
                    <label htmlFor="boardAttachments" className="col-sm-3 col-form-label fw-bold">첨부 이미지</label>
                    <div className="col-sm-9">
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex align-items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="form-control"
                                    id="boardAttachments"
                                    onChange={changeFiles}
                                    accept="image/*"
                                    multiple
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-danger text-nowrap"
                                    onClick={clearFiles}
                                    disabled={files.length === 0}
                                >
                                    초기화
                                </button>
                            </div>

                            {/* 미리보기 카드 영역 */}
                            <div className="d-flex flex-wrap gap-3 mt-2">
                                {previews.length === 0 && (
                                    <small className="text-muted">선택된 이미지가 없습니다.</small>
                                )}

                                {previews.map((p, idx) => (
                                    <div
                                        key={`${p.file.name}_${idx}`}
                                        className="card"
                                        style={{ width: '150px' }}
                                    >
                                        <div style={{ height: '100px', overflow: 'hidden', borderBottom: '1px solid #eee' }}>
                                            <img
                                                src={p.url}
                                                alt={p.file.name}
                                                className="card-img-top"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="card-body p-2 text-center">
                                            <small className="card-title text-truncate d-block mb-2" title={p.file.name}>
                                                {p.file.name}
                                            </small>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger w-100"
                                                onClick={() => removeFile(idx)}
                                            >
                                                <FaXmark /> 삭제
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. 버튼 영역 */}
                <div className="row mt-5">
                    <div className="col text-end border-top pt-4">
                        <button
                            type="button"
                            className="btn btn-primary btn-lg me-2"
                            onClick={handleSubmit}
                        >
                            <FaPlus className="me-2" /> 작성 완료
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-secondary btn-lg" 
                            onClick={() => navigate("/board/list")}
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}