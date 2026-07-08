import React from "react";

export function usePagination<T>(rows: T[], pageSize = 10) {
    const [currentPage, setCurrentPage] = React.useState(1);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [rows, pageSize]);

    const totalRows = rows.length;
    const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
        rows: rows.slice(startIndex, endIndex),
        currentPage: safePage,
        totalPages,
        totalRows,
        pageSize,
        goPrevious: () => setCurrentPage((page) => Math.max(page - 1, 1)),
        goNext: () => setCurrentPage((page) => Math.min(page + 1, totalPages)),
        setCurrentPage
    };
}