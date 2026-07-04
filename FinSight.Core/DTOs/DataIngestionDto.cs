namespace FinSight.Core.DTOs
{
    public class CsvTransactionRowDto
    {
        public string TransactionId { get; set; } = string.Empty;
        public string AccountId { get; set; } = string.Empty;
        public string CustomerId { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public string Amount { get; set; } = string.Empty;
        public string TransactionDate { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class BronzeTransactionRowDto
    {
        public Guid BatchId { get; set; }
        public int RawRowNumber { get; set; }
        public string SourceFile { get; set; } = string.Empty;
        public DateTime IngestionTimestampUtc { get; set; }

        public string TransactionId { get; set; } = string.Empty;
        public string AccountId { get; set; } = string.Empty;
        public string CustomerId { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public string Amount { get; set; } = string.Empty;
        public string TransactionDate { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class SilverTransactionRowDto
    {
        public int TransactionId { get; set; }
        public int AccountId { get; set; }
        public int CustomerId { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public string TransactionTypeNormalized { get; set; } = string.Empty;
        public string CashFlowDirection { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class GoldCustomerAccountSummaryDto
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int AccountId { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public int TransactionCount { get; set; }
        public decimal TotalInflowAmount { get; set; }
        public decimal TotalOutflowAmount { get; set; }
        public decimal NetCashFlow { get; set; }
        public DateTime LatestTransactionDate { get; set; }
    }

    public class RejectedTransactionRowDto
    {
        public int RawRowNumber { get; set; }
        public string Reason { get; set; } = string.Empty;
        public CsvTransactionRowDto RawRow { get; set; } = new CsvTransactionRowDto();
    }

    public class TransactionTypeSummaryDto
    {
        public string TransactionType { get; set; } = string.Empty;
        public string CashFlowDirection { get; set; } = string.Empty;
        public int TransactionCount { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class DailyTransactionTrendDto
    {
        public DateTime TransactionDate { get; set; }
        public string CashFlowDirection { get; set; } = string.Empty;
        public int TransactionCount { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class ReportingSummaryDto
    {
        public List<SilverTransactionRowDto> HighValueTransactions { get; set; } = new();
        public List<TransactionTypeSummaryDto> TransactionVolumeByType { get; set; } = new();
        public List<DailyTransactionTrendDto> DailyTransactionTrend { get; set; } = new();
    }

    public class PipelineStepResultDto
    {
        public string Name { get; set; } = string.Empty;
        public string Layer { get; set; } = string.Empty;
        public string Status { get; set; } = "Complete";
        public int InputRows { get; set; }
        public int OutputRows { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<string> Transformations { get; set; } = new();
    }

    public class IngestionPipelineResultDto
    {
        public Guid BatchId { get; set; }
        public string SourceFile { get; set; } = string.Empty;
        public DateTime StartedAtUtc { get; set; }
        public DateTime CompletedAtUtc { get; set; }

        public List<PipelineStepResultDto> Steps { get; set; } = new();
        public List<BronzeTransactionRowDto> BronzeRows { get; set; } = new();
        public List<SilverTransactionRowDto> SilverRows { get; set; } = new();
        public List<RejectedTransactionRowDto> RejectedRows { get; set; } = new();
        public List<GoldCustomerAccountSummaryDto> GoldRows { get; set; } = new();
        public ReportingSummaryDto Reporting { get; set; } = new();
    }
}