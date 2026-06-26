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
        private readonly IWithdrawalService _withdrawalService;
        private readonly ITransferService _transferService;

        public AccountsController(
            IAccountService accountService,
            IDepositService depositService,
            IWithdrawalService withdrawalService,
            ITransactionService transactionService,
            ITransferService transferService)
        {
            _accountService = accountService;
            _depositService = depositService;
            _withdrawalService = withdrawalService;
            _transactionService = transactionService;
            _transferService = transferService;
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

        [HttpPost("{accountId}/withdraw")]
        [Authorize(Roles = "Admin,Analyst")]
        public async Task<ActionResult<TransactionDto>> Withdraw(
            int accountId,
            WithdrawalRequest request)
        {
            var transaction = await _withdrawalService.WithdrawAsync(accountId, request);
            return Ok(transaction);
        }

        [HttpPost("transfer")]
        [Authorize(Roles = "Admin,Analyst")]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> Transfer(
            TransferRequest request)
        {
            var transactions = await _transferService.TransferAsync(request);
            return Ok(transactions);
        }

    }
}