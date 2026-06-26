using FinSight.Core.DTOs;
using FinSight.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSight.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountsController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Analyst,Auditor")]
        public async Task<ActionResult<PagedResult<AccountDto>>> GetAccounts(
            [FromQuery] AccountQueryParameters query)
        {
            var accounts = await _accountService.GetAccountsAsync(query);
            return Ok(accounts);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Analyst")]
        public async Task<ActionResult<AccountDto>> CreateAccount(CreateAccountRequest request)
        {
            var account = await _accountService.CreateAccountAsync(request);
            return CreatedAtAction(nameof(GetAccounts), new { id = account.Id }, account);
        }
    }
}