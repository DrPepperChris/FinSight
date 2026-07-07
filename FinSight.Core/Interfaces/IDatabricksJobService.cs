using FinSight.Core.DTOs;

namespace FinSight.Core.Interfaces
{
    public interface IDatabricksJobService
    {
        Task<DatabricksJobValidationResultDto> ValidateJobAsync(
            DatabricksJobValidationRequestDto request);

        Task<DatabricksJobRunResultDto> RunJobAsync(
            DatabricksJobRunRequestDto request);

        Task<DatabricksJobStatusDto> GetJobStatusAsync(string runId);
    }
}