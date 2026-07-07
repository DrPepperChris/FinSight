using FinSight.Core.DTOs;
using FinSight.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSight.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class DataIngestionController : ControllerBase
    {
        private readonly IDataIngestionService _dataIngestionService;

        public DataIngestionController(IDataIngestionService dataIngestionService)
        {
            _dataIngestionService = dataIngestionService;
        }

        [HttpPost("sample")]
        [Authorize(Roles = "Admin,Analyst,Auditor")]
        public async Task<ActionResult<IngestionPipelineResultDto>> RunSamplePipeline()
        {
            var result = await _dataIngestionService.RunSamplePipelineAsync();
            return Ok(result);
        }

        [HttpPost("upload")]
        [Authorize(Roles = "Admin,Analyst")]
        [RequestSizeLimit(2_000_000)]
        public async Task<ActionResult<IngestionPipelineResultDto>> UploadCsv(IFormFile file)
        {
            if (file == null)
            {
                return BadRequest(new { message = "CSV file is required." });
            }

            if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Only CSV files are supported." });
            }

            try
            {
                using var stream = file.OpenReadStream();

                var result = await _dataIngestionService.RunUploadedCsvAsync(
                    stream,
                    file.FileName);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}