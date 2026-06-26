namespace FinSight.Core.DTOs
{
    public class CustomerQueryParameters
    {
        public string? Search { get; set; }

        public string? RiskRating { get; set; }

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;

        public string SortBy { get; set; } = "LastName";

        public bool Descending { get; set; }
    }
}