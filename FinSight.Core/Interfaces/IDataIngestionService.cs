using FinSight.Core.DTOs;

namespace FinSight.Core.Interfaces
{
    public interface IDataIngestionService
    {
        Task<IngestionPipelineResultDto> RunSamplePipelineAsync();

        Task<IngestionPipelineResultDto> RunUploadedCsvAsync(Stream fileStream, string fileName);
    }
}