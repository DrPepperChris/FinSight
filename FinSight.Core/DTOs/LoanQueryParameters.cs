// LoanQueryParameters.cs
using FinSight.Core.Enums;

namespace FinSight.Core.DTOs
{
    public class LoanQueryParameters
    {
        public int? CustomerId { get; set; }
        public LoanStatus? Status { get; set; }
        public string? Search { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "ApplicationDate";
        public bool Descending { get; set; } = true;
    }
}