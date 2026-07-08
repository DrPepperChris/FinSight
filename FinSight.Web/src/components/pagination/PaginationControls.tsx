interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalRows: number;
    pageSize: number;
    onPrevious: () => void;
    onNext: () => void;
}

export function PaginationControls({
    currentPage,
    totalPages,
    totalRows,
    pageSize,
    onPrevious,
    onNext
}: PaginationControlsProps) {
    if (totalRows <= pageSize) {
        return null;
    }

    const startRow = (currentPage - 1) * pageSize + 1;
    const endRow = Math.min(currentPage * pageSize, totalRows);

    return (
        <div className="pagination-controls">
            <span>
                Showing {startRow}-{endRow} of {totalRows}
            </span>

            <div>
                <button
                    type="button"
                    className="secondary-action"
                    onClick={onPrevious}
                    disabled={currentPage <= 1}
                >
                    Previous
                </button>

                <span>
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    type="button"
                    className="secondary-action"
                    onClick={onNext}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}