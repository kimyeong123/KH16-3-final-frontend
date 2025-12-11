// src/components/board/BoardDetail.js

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAtom } from 'jotai'; 
import { adminState } from "../../utils/jotai";
import { FaEye } from "react-icons/fa6";

export default function BoardDetail() {
    const { boardNo } = useParams(); 
    const navigate = useNavigate();
    const [board, setBoard] = useState(null); 
    
    const [isAdmin] = useAtom(adminState);
    
    const loadBoardDetail = useCallback(async () => {
        try {
            if (!boardNo) return; 
            const response = await axios.get(`/board/${boardNo}`);
            setBoard(response.data); 
        } catch (error) {
            console.error("게시물 상세 정보 로딩 실패:", error);
            const errorMessage = error.response?.data?.message || "게시물을 불러오는 데 실패했습니다.";
            toast.error(errorMessage);
            navigate("/board/list"); 
        }
    }, [boardNo, navigate]); 

    useEffect(() => {
        loadBoardDetail();
    }, [loadBoardDetail]);
    
    const handleDelete = async () => {
        if (!window.confirm("관리자 권한으로 게시물을 삭제하시겠습니까?")) return;
        
        try {
            await axios.delete(`/board/${boardNo}`);
            toast.success("게시물이 성공적으로 삭제되었습니다.");
            navigate("/board/list");
        } catch (error) {
            console.error("게시물 삭제 실패:", error);
            const errorMessage = error.response?.data?.message || "게시물 삭제에 실패했습니다.";
            toast.error(errorMessage);
        }
    };
    
    const handleEdit = () => {
        navigate(`/board/edit/${boardNo}`);
    };

    if (!board) {
        return <div className="text-center mt-5">로딩 중...</div>;
    }

    const formatTime = (time) => {
        return time ? new Date(time).toLocaleString() : '-';
    }
    
    const rawContent = { __html: board.content };

    return (
        <div className="container mt-5">
            <h2 className="fw-bold mb-3 border-bottom pb-2">{board.title}</h2> 
            
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center bg-light p-2">
                    <div>
                        {/* 💡 요청하신 불필요한 공백 제거 완료 */}
                        <span className="me-3 fw-bold">{board.writerNickname}</span> 
                        <span className="text-muted small">| 작성일: {formatTime(board.writeTime)}</span>
                    </div>
                    
                    <div>
                        <span className="text-secondary small">
                            <FaEye className="me-1"/> 
                            {board.readCount}
                        </span>
                    </div>
                </div>
                
                <div className="card-body" style={{ minHeight: '300px' }}>
                    <p className="card-text" dangerouslySetInnerHTML={rawContent} />
                </div>
            </div>

            {/* 버튼 영역 */}
            <div className="d-flex justify-content-between">
                <button className="btn btn-secondary" onClick={() => navigate("/board/list")}>
                    목록으로
                </button>
                
                {isAdmin && (
                    <div>
                        <button className="btn btn-primary me-2" onClick={handleEdit}>
                            수정
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete}>
                            삭제
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}