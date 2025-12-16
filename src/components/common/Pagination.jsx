import React from 'react';

/**
 * [페이지네이션 컴포넌트]
 * PageVO의 로직(블록 시작/종료, 이전/다음 페이지)을 기반으로 페이지 번호를 렌더링합니다.
 * * @param {number} dataCount - 총 데이터 개수 (PageVO.dataCount)
 * @param {number} pageSize - 한 페이지당 데이터 개수 (PageVO.size)
 * @param {number} currentPage - 현재 페이지 번호 (PageVO.page)
 * @param {function} onPageChange - 페이지 번호 클릭 시 실행될 함수 (setCurrentPage)
 * @param {number} [blockSize=10] - 표시할 페이지 블록 개수 (PageVO.blockSize)
 */
export default function Pagination({ 
    dataCount, 
    pageSize, 
    currentPage, 
    onPageChange, 
    blockSize = 10 
}) {

    // PageVO의 getTotalPage() 로직 구현
    const getTotalPage = () => {
        if (!dataCount || dataCount === 0) return 1;
        return Math.ceil(dataCount / pageSize);
    };
    
    // PageVO의 블록 계산 로직 구현
    const getBlockStart = () => (Math.floor((currentPage - 1) / blockSize) * blockSize) + 1;
    const getBlockFinish = () => Math.min(getTotalPage(), getBlockStart() + blockSize - 1);
    const isFirstBlock = () => getBlockStart() === 1;
    const isLastBlock = () => getBlockFinish() === getTotalPage();
    const getPrevPage = () => getBlockStart() - 1;
    const getNextPage = () => getBlockFinish() + 1;

    const totalPages = getTotalPage();
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = getBlockStart(); i <= getBlockFinish(); i++) {
        pageNumbers.push(i);
    }

    return (
        <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center mt-4">
                {/* 이전 블록으로 이동 버튼 */}
                {!isFirstBlock() && (
                    <li className="page-item">
                        <button onClick={() => onPageChange(getPrevPage())} className="page-link" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>
                )}

                {/* 페이지 번호 목록 */}
                {pageNumbers.map(number => (
                    <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                        <button onClick={() => onPageChange(number)} className="page-link">
                            {number}
                        </button>
                    </li>
                ))}

                {/* 다음 블록으로 이동 버튼 */}
                {!isLastBlock() && (
                    <li className="page-item">
                        <button onClick={() => onPageChange(getNextPage())} className="page-link" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                    </li>
                )}
            </ul>
        </nav>
    );
}