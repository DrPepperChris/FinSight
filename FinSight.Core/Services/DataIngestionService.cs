using System.Globalization;
using FinSight.Core.DTOs;
using FinSight.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace FinSight.Core.Services
{
    public class DataIngestionService : IDataIngestionService
    {
        private readonly ILogger<DataIngestionService> _logger;

        public DataIngestionService(ILogger<DataIngestionService> logger)
        {
            _logger = logger;
        }

        public Task<IngestionPipelineResultDto> RunSamplePipelineAsync()
        {
            _logger.LogInformation("Running sample data ingestion pipeline.");

            var rows = new List<CsvTransactionRowDto>
            {
                new CsvTransactionRowDto
                {
                    TransactionId = "1",
                    AccountId = "1",
                    CustomerId = "1",
                    AccountNumber = "CHK-100001",
                    CustomerName = "Ethan Sullivan",
                    TransactionType = "Deposit",
                    Amount = "909.99",
                    TransactionDate = "2026-06-26",
                    Description = "deposit"
                },
                new CsvTransactionRowDto
                {
                    TransactionId = "2",
                    AccountId = "1",
                    CustomerId = "1",
                    AccountNumber = "CHK-100001",
                    CustomerName = "Ethan Sullivan",
                    TransactionType = "Withdrawal",
                    Amount = "900.45",
                    TransactionDate = "2026-06-26",
                    Description = "WD TEST"
                },
                new CsvTransactionRowDto
                {
                    TransactionId = "3",
                    AccountId = "1",
                    CustomerId = "1",
                    AccountNumber = "CHK-100001",
                    CustomerName = "Ethan Sullivan",
                    TransactionType = "TransferOut",
                    Amount = "984.32",
                    TransactionDate = "2026-06-26",
                    Description = "xfer test"
                },
                new CsvTransactionRowDto
                {
                    TransactionId = "4",
                    AccountId = "2",
                    CustomerId = "1",
                    AccountNumber = "SAV-100001",
                    CustomerName = "Ethan Sullivan",
                    TransactionType = "Deposit",
                    Amount = "125.22",
                    TransactionDate = "2026-06-27",
                    Description = "initial savings deposit"
                },
                new CsvTransactionRowDto
                {
                    TransactionId = "5",
                    AccountId = "3",
                    CustomerId = "2",
                    AccountNumber = "CRD-100001",
                    CustomerName = "Sophia Bennett",
                    TransactionType = "Withdrawal",
                    Amount = "250.00",
                    TransactionDate = "2026-06-27",
                    Description = "card payment"
                },
                new CsvTransactionRowDto
                {
                    TransactionId = "6",
                    AccountId = "4",
                    CustomerId = "3",
                    AccountNumber = "MMA-100001",
                    CustomerName = "Mia Thompson",
                    TransactionType = "Deposit",
                    Amount = "5000.00",
                    TransactionDate = "2026-06-28",
                    Description = "money market funding"
                },
                new CsvTransactionRowDto
                {
                    TransactionId = "7",
                    AccountId = "4",
                    CustomerId = "3",
                    AccountNumber = "MMA-100001",
                    CustomerName = "Mia Thompson",
                    TransactionType = "Withdrawal",
                    Amount = "1200.00",
                    TransactionDate = "2026-06-29",
                    Description = "large withdrawal"
                },
                new CsvTransactionRowDto
                {
                    TransactionId = "8",
                    AccountId = "3",
                    CustomerId = "2",
                    AccountNumber = "CRD-100001",
                    CustomerName = "Sophia Bennett",
                    TransactionType = "TransferIn",
                    Amount = "1098.32",
                    TransactionDate = "2026-06-29",
                    Description = "transfer received"
                }
            };

            var result = RunPipeline(rows, "transactions_sample.csv");

            return Task.FromResult(result);
        }

        public async Task<IngestionPipelineResultDto> RunUploadedCsvAsync(Stream fileStream, string fileName)
        {
            _logger.LogInformation("Running uploaded CSV ingestion pipeline for file {FileName}.", fileName);

            if (fileStream == null || fileStream.Length == 0)
            {
                throw new InvalidOperationException("Uploaded file is empty.");
            }

            var rows = new List<CsvTransactionRowDto>();

            using var reader = new StreamReader(fileStream);

            var headerLine = await reader.ReadLineAsync();

            if (string.IsNullOrWhiteSpace(headerLine))
            {
                throw new InvalidOperationException("CSV file is missing a header row.");
            }

            var headers = headerLine.Split(',').Select(h => h.Trim()).ToArray();

            var requiredHeaders = new[]
            {
                "transaction_id",
                "account_id",
                "customer_id",
                "account_number",
                "customer_name",
                "transaction_type",
                "amount",
                "transaction_date",
                "description"
            };

            var missingHeaders = requiredHeaders
                .Where(h => !headers.Contains(h, StringComparer.OrdinalIgnoreCase))
                .ToList();

            if (missingHeaders.Any())
            {
                throw new InvalidOperationException(
                    $"CSV is missing required columns: {string.Join(", ", missingHeaders)}");
            }

            var index = headers
                .Select((name, i) => new { name, i })
                .ToDictionary(x => x.name, x => x.i, StringComparer.OrdinalIgnoreCase);

            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();

                if (string.IsNullOrWhiteSpace(line))
                {
                    continue;
                }

                var values = line.Split(',');

                rows.Add(new CsvTransactionRowDto
                {
                    TransactionId = GetValue(values, index, "transaction_id"),
                    AccountId = GetValue(values, index, "account_id"),
                    CustomerId = GetValue(values, index, "customer_id"),
                    AccountNumber = GetValue(values, index, "account_number"),
                    CustomerName = GetValue(values, index, "customer_name"),
                    TransactionType = GetValue(values, index, "transaction_type"),
                    Amount = GetValue(values, index, "amount"),
                    TransactionDate = GetValue(values, index, "transaction_date"),
                    Description = GetValue(values, index, "description")
                });
            }

            return RunPipeline(rows, fileName);
        }

        private IngestionPipelineResultDto RunPipeline(List<CsvTransactionRowDto> rawRows, string sourceFile)
        {
            var batchId = Guid.NewGuid();
            var startedAt = DateTime.UtcNow;

            var bronzeRows = rawRows
                .Select((row, index) => new BronzeTransactionRowDto
                {
                    BatchId = batchId,
                    RawRowNumber = index + 1,
                    SourceFile = sourceFile,
                    IngestionTimestampUtc = startedAt,
                    TransactionId = row.TransactionId,
                    AccountId = row.AccountId,
                    CustomerId = row.CustomerId,
                    AccountNumber = row.AccountNumber,
                    CustomerName = row.CustomerName,
                    TransactionType = row.TransactionType,
                    Amount = row.Amount,
                    TransactionDate = row.TransactionDate,
                    Description = row.Description
                })
                .ToList();

            var silverRows = new List<SilverTransactionRowDto>();
            var rejectedRows = new List<RejectedTransactionRowDto>();

            foreach (var bronze in bronzeRows)
            {
                if (TryCreateSilverRow(bronze, out var silverRow, out var reason) && silverRow != null)
                {
                    silverRows.Add(silverRow);
                }
                else
                {
                    rejectedRows.Add(new RejectedTransactionRowDto
                    {
                        RawRowNumber = bronze.RawRowNumber,
                        Reason = reason,
                        RawRow = new CsvTransactionRowDto
                        {
                            TransactionId = bronze.TransactionId,
                            AccountId = bronze.AccountId,
                            CustomerId = bronze.CustomerId,
                            AccountNumber = bronze.AccountNumber,
                            CustomerName = bronze.CustomerName,
                            TransactionType = bronze.TransactionType,
                            Amount = bronze.Amount,
                            TransactionDate = bronze.TransactionDate,
                            Description = bronze.Description
                        }
                    });
                }
            }

            var goldRows = silverRows
                .GroupBy(x => new { x.CustomerId, x.CustomerName, x.AccountId, x.AccountNumber })
                .Select(group =>
                {
                    var totalInflow = group
                        .Where(x => x.CashFlowDirection == "Inflow")
                        .Sum(x => x.Amount);

                    var totalOutflow = group
                        .Where(x => x.CashFlowDirection == "Outflow")
                        .Sum(x => x.Amount);

                    return new GoldCustomerAccountSummaryDto
                    {
                        CustomerId = group.Key.CustomerId,
                        CustomerName = group.Key.CustomerName,
                        AccountId = group.Key.AccountId,
                        AccountNumber = group.Key.AccountNumber,
                        TransactionCount = group.Count(),
                        TotalInflowAmount = totalInflow,
                        TotalOutflowAmount = totalOutflow,
                        NetCashFlow = totalInflow - totalOutflow,
                        LatestTransactionDate = group.Max(x => x.TransactionDate)
                    };
                })
                .OrderBy(x => x.CustomerName)
                .ThenBy(x => x.AccountNumber)
                .ToList();

            var reporting = new ReportingSummaryDto
            {
                HighValueTransactions = silverRows
                    .Where(x => x.Amount >= 1000)
                    .OrderByDescending(x => x.Amount)
                    .ToList(),

                TransactionVolumeByType = silverRows
                    .GroupBy(x => new { x.TransactionTypeNormalized, x.CashFlowDirection })
                    .Select(group => new TransactionTypeSummaryDto
                    {
                        TransactionType = group.Key.TransactionTypeNormalized,
                        CashFlowDirection = group.Key.CashFlowDirection,
                        TransactionCount = group.Count(),
                        TotalAmount = group.Sum(x => x.Amount)
                    })
                    .OrderBy(x => x.TransactionType)
                    .ToList(),

                DailyTransactionTrend = silverRows
                    .GroupBy(x => new { x.TransactionDate.Date, x.CashFlowDirection })
                    .Select(group => new DailyTransactionTrendDto
                    {
                        TransactionDate = group.Key.Date,
                        CashFlowDirection = group.Key.CashFlowDirection,
                        TransactionCount = group.Count(),
                        TotalAmount = group.Sum(x => x.Amount)
                    })
                    .OrderBy(x => x.TransactionDate)
                    .ThenBy(x => x.CashFlowDirection)
                    .ToList()
            };

            return new IngestionPipelineResultDto
            {
                BatchId = batchId,
                SourceFile = sourceFile,
                StartedAtUtc = startedAt,
                CompletedAtUtc = DateTime.UtcNow,
                BronzeRows = bronzeRows,
                SilverRows = silverRows,
                RejectedRows = rejectedRows,
                GoldRows = goldRows,
                Reporting = reporting,
                Steps = new List<PipelineStepResultDto>
                {
                    new PipelineStepResultDto
                    {
                        Name = "Raw CSV Ingestion",
                        Layer = "Bronze",
                        InputRows = rawRows.Count,
                        OutputRows = bronzeRows.Count,
                        Description = "Preserves raw source rows and adds ingestion metadata.",
                        Transformations = new List<string>
                        {
                            "Generated batch ID",
                            "Captured source file",
                            "Added ingestion timestamp",
                            "Assigned raw row numbers"
                        }
                    },
                    new PipelineStepResultDto
                    {
                        Name = "Transaction Cleaning",
                        Layer = "Silver",
                        InputRows = bronzeRows.Count,
                        OutputRows = silverRows.Count,
                        Description = "Validates, parses, types, and standardizes transaction records.",
                        Transformations = new List<string>
                        {
                            "Parsed numeric IDs",
                            "Converted amount to decimal",
                            "Parsed transaction date",
                            "Normalized transaction type",
                            "Classified inflow and outflow activity",
                            "Separated rejected records"
                        }
                    },
                    new PipelineStepResultDto
                    {
                        Name = "Customer Account Aggregation",
                        Layer = "Gold",
                        InputRows = silverRows.Count,
                        OutputRows = goldRows.Count,
                        Description = "Creates business-ready customer and account analytics summaries.",
                        Transformations = new List<string>
                        {
                            "Grouped by customer and account",
                            "Calculated total inflow",
                            "Calculated total outflow",
                            "Calculated net cash flow",
                            "Captured latest transaction date"
                        }
                    },
                    new PipelineStepResultDto
                    {
                        Name = "Reporting Views",
                        Layer = "Reporting",
                        InputRows = silverRows.Count,
                        OutputRows = reporting.HighValueTransactions.Count
                            + reporting.TransactionVolumeByType.Count
                            + reporting.DailyTransactionTrend.Count,
                        Description = "Creates dashboard-ready reporting outputs.",
                        Transformations = new List<string>
                        {
                            "High-value transaction review",
                            "Transaction volume by type",
                            "Daily cash-flow trend"
                        }
                    }
                }
            };
        }

        private static bool TryCreateSilverRow(
            BronzeTransactionRowDto bronze,
            out SilverTransactionRowDto? silverRow,
            out string reason)
        {
            silverRow = null;
            reason = string.Empty;

            if (!int.TryParse(bronze.TransactionId, out var transactionId))
            {
                reason = "Invalid transaction_id.";
                return false;
            }

            if (!int.TryParse(bronze.AccountId, out var accountId))
            {
                reason = "Invalid account_id.";
                return false;
            }

            if (!int.TryParse(bronze.CustomerId, out var customerId))
            {
                reason = "Invalid customer_id.";
                return false;
            }

            if (!decimal.TryParse(bronze.Amount, NumberStyles.Number, CultureInfo.InvariantCulture, out var amount))
            {
                reason = "Invalid amount.";
                return false;
            }

            if (!DateTime.TryParse(bronze.TransactionDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out var transactionDate))
            {
                reason = "Invalid transaction_date.";
                return false;
            }

            var normalizedType = NormalizeTransactionType(bronze.TransactionType);

            if (normalizedType == "Other")
            {
                reason = "Unsupported transaction_type.";
                return false;
            }

            silverRow = new SilverTransactionRowDto
            {
                TransactionId = transactionId,
                AccountId = accountId,
                CustomerId = customerId,
                AccountNumber = bronze.AccountNumber.Trim(),
                CustomerName = ToTitleCase(bronze.CustomerName.Trim()),
                TransactionType = bronze.TransactionType.Trim(),
                TransactionTypeNormalized = normalizedType,
                CashFlowDirection = GetCashFlowDirection(normalizedType),
                Amount = amount,
                TransactionDate = transactionDate.Date,
                Description = bronze.Description.Trim()
            };

            return true;
        }

        private static string NormalizeTransactionType(string value)
        {
            var cleaned = value.Trim().Replace(" ", string.Empty).ToUpperInvariant();

            return cleaned switch
            {
                "DEPOSIT" => "Deposit",
                "WITHDRAWAL" => "Withdrawal",
                "TRANSFERIN" => "Transfer In",
                "TRANSFEROUT" => "Transfer Out",
                _ => "Other"
            };
        }

        private static string GetCashFlowDirection(string normalizedType)
        {
            return normalizedType switch
            {
                "Deposit" => "Inflow",
                "Transfer In" => "Inflow",
                "Withdrawal" => "Outflow",
                "Transfer Out" => "Outflow",
                _ => "Unknown"
            };
        }

        private static string ToTitleCase(string value)
        {
            return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(value.ToLowerInvariant());
        }

        private static string GetValue(string[] values, Dictionary<string, int> index, string key)
        {
            var i = index[key];
            return i < values.Length ? values[i].Trim() : string.Empty;
        }
    }
}