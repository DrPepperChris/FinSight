interface FilterOption {
    value: string;
    label: string;
}

interface SearchFilterBarProps {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    searchPlaceholder?: string;
    filterValue?: string;
    onFilterValueChange?: (value: string) => void;
    filterLabel?: string;
    filterOptions?: FilterOption[];
}

export function SearchFilterBar({
    searchTerm,
    onSearchTermChange,
    searchPlaceholder = "Search...",
    filterValue,
    onFilterValueChange,
    filterLabel = "Filter",
    filterOptions = []
}: SearchFilterBarProps) {
    return (
        <div className="search-filter-bar">
            <label>
                Search
                <input
                    value={searchTerm}
                    placeholder={searchPlaceholder}
                    onChange={(event) => onSearchTermChange(event.target.value)}
                />
            </label>

            {onFilterValueChange && filterOptions.length > 0 && (
                <label>
                    {filterLabel}
                    <select
                        value={filterValue ?? "all"}
                        onChange={(event) => onFilterValueChange(event.target.value)}
                    >
                        {filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            )}
        </div>
    );
}