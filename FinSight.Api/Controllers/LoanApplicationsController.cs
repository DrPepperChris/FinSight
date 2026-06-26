using FinSight.Core.DTOs;
using FinSight.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSight.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LoanApplicationsController : ControllerBase
    {
        private readonly ILoanApplicationService _loanService;

        public LoanApplicationsController(ILoanApplicationService loanService)
        {
            _loanService = loanService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Analyst,Auditor")]
        public async Task<ActionResult<PagedResult<LoanApplicationDto>>> GetLoans(
            [FromQuery] LoanQueryParameters query)
        {
            var loans = await _loanService.GetLoansAsync(query);
            return Ok(loans);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Analyst")]
        public async Task<ActionResult<LoanApplicationDto>> Create(
            CreateLoanApplicationRequest request)
        {
            var loan = await _loanService.CreateLoanApplicationAsync(request);

            return CreatedAtAction(nameof(GetLoans), new { id = loan.Id }, loan);
        }

        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<LoanApplicationDto>> Approve(
            int id,
            LoanDecisionRequest request)
        {
            var loan = await _loanService.ApproveAsync(id, request);
            return Ok(loan);
        }

        [HttpPost("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<LoanApplicationDto>> Reject(
            int id,
            LoanDecisionRequest request)
        {
            var loan = await _loanService.RejectAsync(id, request);
            return Ok(loan);
        }
    }
}