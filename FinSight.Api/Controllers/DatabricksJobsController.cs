using FinSight.Core.DTOs;
using FinSight.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSight.Api.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin,Analyst")]
    [Route("api/Databricks/jobs")]
    public class DatabricksJobsController : ControllerBase
    {
        private readonly IDatabricksJobService _databricksJobService;

        public DatabricksJobsController(IDatabricksJobService databricksJobService)
        {
            _databricksJobService = databricksJobService;
        }

        [HttpPost("validate")]
        public async Task<ActionResult<DatabricksJobValidationResultDto>> ValidateJob(
            [FromBody] DatabricksJobValidationRequestDto request)
        {
            var result = await _databricksJobService.ValidateJobAsync(request);
            return Ok(result);
        }

        [HttpPost("run")]
        public async Task<ActionResult<DatabricksJobRunResultDto>> RunJob(
            [FromBody] DatabricksJobRunRequestDto request)
        {
            var result = await _databricksJobService.RunJobAsync(request);
            return Ok(result);
        }

        [HttpGet("status/{runId}")]
        public async Task<ActionResult<DatabricksJobStatusDto>> GetJobStatus(
            string runId)
        {
            var result = await _databricksJobService.GetJobStatusAsync(runId);
            return Ok(result);
        }
    }
}