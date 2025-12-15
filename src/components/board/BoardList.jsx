// src/components/board/BoardList.js

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAtom } from 'jotai';
import { loginState, adminState } from '../../utils/jotai'; 
import { toast } from 'react-toastify';
import { FaPen } from "react-icons/fa6"; // 글쓰기 아이콘


export default function BoardList() {
    const navigate = useNavigate();
    const [boardList, setBoardList] = useState([]);
    const [isLogin] = useAtom(loginState);
    const [isAdmin] = useAtom(adminState); // 상태를 가져옵니다.
    
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10); 

    // [서버에서 게시물 목록을 가져오는 함수]
    const loadBoardList = useCallback(async () => {
        try {
            const response = await axios.get("/board/list"); 
            setBoardList(response.data); 
        } catch (error) {
            console.error("게시물 목록 로딩 실패:", error);
            const errorMessage = error.response?.data?.message || "게시물 목록을 불러오는 데 실패했습니다.";
            toast.error(errorMessage); 
            setBoardList([]); 
        }
    }, []); 

    // 컴포넌트 마운트 시 목록 로드
    useEffect(() => {
        loadBoardList();
    }, [loadBoardList]);


    // [게시물 상세 페이지로 이동]
    const goToDetail = (boardNo) => {
        navigate(`/board/${boardNo}`);
    };

    // [글쓰기 페이지로 이동]
    const goToWrite = () => {
        if (!isLogin) {
            toast.warn("로그인 후 이용 가능합니다.");
            navigate("/member/login");
        } 
        else if(!isAdmin) {
            toast.warn("작성은 관리자만 가능합니다");
        }
        else {
            navigate("/board/write");
        }
    };


    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fw-bold text-primary">공지사항</h2>
                
                {/* 글쓰기 버튼 (로그인 && 관리자일 때만 표시) */}
                {(isAdmin) && (
                    <button className="btn btn-outline-success" onClick={goToWrite}>
                        <FaPen className="fs-5 me-1" /> 글쓰기
                    </button>
                )}
            </div>

            <table className="table table-hover table-striped">
                <thead className="table-dark">
                    <tr>
                        <th style={{ width: '10%' }}>No</th>
                        <th style={{ width: '50%' }}>제목</th>
                        <th style={{ width: '15%' }}>작성자</th>
                        <th style={{ width: '15%' }}>작성일</th>
                        <th style={{ width: '10%' }}>조회수</th>
                    </tr>
                </thead>
                <tbody>
                    {boardList.length > 0 ? (
                        boardList.map((board) => (
                            <tr key={board.boardNo} onClick={() => goToDetail(board.boardNo)} style={{ cursor: 'pointer' }}>
                                <td>{board.boardNo}</td>
                                <td>{board.title}</td> 
                                <td>{board.writer}</td> 
                                <td>{board.writeTime ? board.writeTime.substring(0, 10) : '-'}</td> 
                                <td>{board.readCount}</td> 
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center text-muted py-4">게시물이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="d-flex justify-content-center mt-4">
                {/* ⚠️ 페이지네이션 UI를 여기에 구현해야 합니다. */}
            </div>
        </div>
    );
}