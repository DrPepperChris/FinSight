using FinSight.Core.DTOs;
using FinSight.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace FinSight.Core.Services
{
    public class DatabricksJobService : IDatabricksJobService
    {
        private readonly ILogger<DatabricksJobService> _logger;

        public DatabricksJobService(ILogger<DatabricksJobService> logger)
        {
            _logger = logger;
        }

        public Task<DatabricksJobValidationResultDto> ValidateJobAsync(
            DatabricksJobValidationRequestDto request)
        {
            var messages = new List<string>();
            var warnings = new List<string>();

            if (string.IsNullOrWhiteSpace(request.SourceType))
            {
                messages.Add("Source type is required.");
            }

            if (string.IsNullOrWhiteSpace(request.BronzeTable))
            {
                messages.Add("Bronze table is required.");
            }

            if (string.IsNullOrWhiteSpace(request.SilverTable))
            {
                messages.Add("Silver table is required.");
            }

            if (string.IsNullOrWhiteSpace(request.GoldTable))
            {
                messages.Add("Gold table is required.");
            }

            if (request.Transformations.Count == 0)
            {
                warnings.Add("No Silver transformations were selected.");
            }

            if (!request.BronzeTable.Contains("bronze", StringComparison.OrdinalIgnoreCase))
            {
                warnings.Add("Bronze table name does not include the word 'bronze'.");
            }

            if (!request.SilverTable.Contains("silver", StringComparison.OrdinalIgnoreCase))
            {
                warnings.Add("Silver table name does not include the word 'silver'.");
            }

            if (!request.GoldTable.Contains("gold", StringComparison.OrdinalIgnoreCase))
            {
                warnings.Add("Gold table name does not include the word 'gold'.");
            }

            var isValid = messages.Count == 0;

            var result = new DatabricksJobValidationResultDto
            {
                IsValid = isValid,
                Status = isValid ? "Valid" : "Invalid",
                Messages = isValid
                    ? new List<string>
                    {
                        "Databricks design configuration is valid.",
                        "Bronze, Silver, and Gold targets are configured.",
                        "This validation is a portfolio-safe simulation and does not submit a real Databricks job."
                    }
                    : messages,
                Warnings = warnings
            };

            return Task.FromResult(result);
        }

        public Task<DatabricksJobRunResultDto> RunJobAsync(
            DatabricksJobRunRequestDto request)
        {
            var runId = $"dbx-sim-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"[..32];

            _logger.LogInformation(
                "Simulated Databricks job run created. RunId: {RunId}, SourceType: {SourceType}, GoldTable: {GoldTable}",
                runId,
                request.SourceType,
                request.GoldTable);

            var result = new DatabricksJobRunResultDto
            {
                RunId = runId,
                Status = "Submitted",
                SubmittedAtUtc = DateTime.UtcNow.ToString("O"),
                Message = "Simulated Databricks job submitted successfully. This portfolio-safe workflow validates the pipeline design without calling an external Databricks workspace.",
                PlannedSteps = new List<string>
                {
                    "Validate source configuration",
                    "Ingest raw records into Bronze Delta table",
                    "Apply Silver validation and transformation rules",
                    "Build selected Gold business output",
                    "Refresh reporting-ready views"
                }
            };

            return Task.FromResult(result);
        }

        public Task<DatabricksJobStatusDto> GetJobStatusAsync(string runId)
        {
            var result = new DatabricksJobStatusDto
            {
                RunId = runId,
                Status = "Succeeded",
                PercentComplete = 100,
                LastUpdatedUtc = DateTime.UtcNow.ToString("O"),
                CompletedSteps = new List<string>
                {
                    "Validated source configuration",
                    "Created Bronze ingestion plan",
                    "Applied Silver transformation plan",
                    "Generated Gold output plan",
                    "Prepared reporting view plan"
                },
                Message = "Simulated Databricks job completed successfully."
            };

            return Task.FromResult(result);
        }
    }
}