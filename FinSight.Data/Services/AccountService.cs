using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Enums;
using FinSight.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace FinSight.Core.Services
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly ILogger<AccountService> _logger;

        public AccountService(
            IAccountRepository accountRepository,
            ILogger<AccountService> logger)
        {
            _accountRepository = accountRepository;
            _logger = logger;
        }

        public async Task<PagedResult<AccountDto>> GetAccountsAsync(AccountQueryParameters query)
        {
            var pagedAccounts = await _accountRepository.GetAccountsAsync(query);

            return new PagedResult<AccountDto>
            {
                Items = pagedAccounts.Items.Select(MapToDto),
                Page = pagedAccounts.Page,
                PageSize = pagedAccounts.PageSize,
                TotalRecords = pagedAccounts.TotalRecords
            };
        }

        public async Task<AccountDto> CreateAccountAsync(CreateAccountRequest request)
        {
            if (!await _accountRepository.CustomerExistsAsync(request.CustomerId))
            {
                throw new InvalidOperationException("Customer does not exist.");
            }

            if (await _accountRepository.AccountExistsAsync(request.AccountNumber))
            {
                throw new InvalidOperationException("An account with this account number already exists.");
            }

            if (request.InitialDeposit < 0)
            {
                throw new InvalidOperationException("Initial deposit cannot be negative.");
            }

            var account = new Account
            {
                AccountNumber = request.AccountNumber,
                AccountType = request.AccountType,
                Status = AccountStatus.Active,
                CurrentBalance = request.InitialDeposit,
                AvailableBalance = request.InitialDeposit,
                InterestRate = request.InterestRate,
                CustomerId = request.CustomerId
            };

            var createdAccount = await _accountRepository.AddAsync(account);

            _logger.LogInformation("Account created. AccountId: {AccountId}", createdAccount.Id);

            return MapToDto(createdAccount);
        }

        private static AccountDto MapToDto(Account account)
        {
            return new AccountDto
            {
                Id = account.Id,
                AccountNumber = account.AccountNumber,
                AccountType = account.AccountType,
                Status = account.Status,
                CurrentBalance = account.CurrentBalance,
                AvailableBalance = account.AvailableBalance,
                InterestRate = account.InterestRate,
                OpenDate = account.OpenDate,
                ClosedDate = account.ClosedDate,
                CustomerId = account.CustomerId,
                CustomerName = account.Customer == null
                    ? string.Empty
                    : account.Customer.FirstName + " " + account.Customer.LastName
            };
        }
    }
}