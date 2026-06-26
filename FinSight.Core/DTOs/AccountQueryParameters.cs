using FinSight.Core.Enums;

namespace FinSight.Core.DTOs
{
    public class AccountQueryParameters
    {
        public int? CustomerId { get; set; }
        public AccountType? AccountType { get; set; }
        public AccountStatus? Status { get; set; }
        public string? Search { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "AccountNumber";
        public bool Descending { get; set; }
    }
}