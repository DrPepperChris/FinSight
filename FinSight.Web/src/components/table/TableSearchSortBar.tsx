interface TableSortOption {
    value: string;
    label: string;
}

interface TableSearchSortBarProps<TSortField extends string> {
    isSearchOpen: boolean;
    searchTerm: string;
    searchPlaceholder: string;
    sortField: TSortField;
    sortDirection: "asc" | "desc";
    sortOptions: TableSortOption[];
    onToggleSearch: () => void;
    onSearchTermChange: (value: string) => void;
    onSortFieldChange: (value: TSortField) => void;
    onSortDirectionChange: (value: "asc" | "desc") => void;
}

export function TableSearchSortBar<TSortField extends string>({
    isSearchOpen,
    searchTerm,
    searchPlaceholder,
    sortField,
    sortDirection,
    sortOptions,
    onToggleSearch,
    onSearchTermChange,
    onSortFieldChange,
    onSortDirectionChange
}: TableSearchSortBarProps<TSortField>) {
    return (
        <div className="table-search-panel">
            <div className="table-search-row">
                <button
                    type="button"
                    className="table-search-toggle table-search-icon-button"
                    aria-label="Toggle search"
                    title="Search"
                    onClick={onToggleSearch}
                >
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <line x1="16.65" y1="16.65" x2="21" y2="21" />
                    </svg>
                </button>

                {isSearchOpen && (
                    <input
                        className="table-search-input"
                        value={searchTerm}
                        placeholder={searchPlaceholder}
                        onChange={(event) => onSearchTermChange(event.target.value)}
                    />
                )}

                <select
                    className="table-sort-select"
                    value={sortField}
                    onChange={(event) =>
                        onSortFieldChange(event.target.value as TSortField)
                    }
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="table-sort-icon-button"
                    onClick={() =>
                        onSortDirectionChange(
                            sortDirection === "asc" ? "desc" : "asc"
                        )
                    }
                    aria-label={
                        sortDirection === "asc"
                            ? "Sort ascending"
                            : "Sort descending"
                    }
                    title={
                        sortDirection === "asc"
                            ? "Ascending"
                            : "Descending"
                    }
                >
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="5" y1="5" x2="5" y2="19" />
                        <polyline
                            points={
                                sortDirection === "asc"
                                    ? "2 8 5 5 8 8"
                                    : "2 16 5 19 8 16"
                            }
                        />
                        <line x1="11" y1="7" x2="21" y2="7" />
                        <line x1="11" y1="12" x2="18" y2="12" />
                        <line x1="11" y1="17" x2="15" y2="17" />
                    </svg>
                </button>
            </div>
        </div>
    );
}