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
        private readonly IDepositService _depositService;
        private readonly ITransactionService _transactionService;

        public AccountsController(
            IAccountService accountService,
            IDepositService depositService,
            ITransactionService transactionService)
        {
            _accountService = accountService;
            _depositService = depositService;
            _transactionService = transactionService;
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

        [HttpPost("{accountId}/deposit")]
        [Authorize(Roles = "Admin,Analyst")]
        public async Task<ActionResult<TransactionDto>> Deposit(
            int accountId,
            DepositRequest request)
        {
            var transaction = await _depositService.DepositAsync(accountId, request);
            return Ok(transaction);
        }


        [HttpGet("{accountId}/transactions")]
        [Authorize(Roles = "Admin,Analyst,Auditor")]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetTransactions(
            int accountId)
        {
            var transactions = await _transactionService.GetTransactionsByAccountIdAsync(accountId);
            return Ok(transactions);
        }
    }
}