using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Enums;
using FinSight.Core.Interfaces;

namespace FinSight.Core.Services
{
    public class DepositService : IDepositService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DepositService(
            IAccountRepository accountRepository,
            ITransactionRepository transactionRepository,
            IUnitOfWork unitOfWork)
        {
            _accountRepository = accountRepository;
            _transactionRepository = transactionRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<TransactionDto> DepositAsync(int accountId, DepositRequest request)
        {
            if (request.Amount <= 0)
            {
                throw new InvalidOperationException("Deposit amount must be greater than zero.");
            }

            var account = await _accountRepository.GetByIdAsync(accountId);

            if (account == null)
            {
                throw new InvalidOperationException("Account does not exist.");
            }

            if (account.Status != AccountStatus.Active)
            {
                throw new InvalidOperationException("Deposits can only be made to active accounts.");
            }

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                account.CurrentBalance += request.Amount;
                account.AvailableBalance += request.Amount;

                var transaction = new BankTransaction
                {
                    AccountId = account.Id,
                    Amount = request.Amount,
                    TransactionType = TransactionType.Deposit,
                    Description = request.Description,
                    BalanceAfterTransaction = account.CurrentBalance,
                    TransactionDate = DateTime.UtcNow,
                    TransactionNumber = $"DEP-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                    ReferenceNumber = Guid.NewGuid().ToString("N")
                };

                await _transactionRepository.AddAsync(transaction);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return new TransactionDto
                {
                    Id = transaction.Id,
                    AccountId = transaction.AccountId,
                    Amount = transaction.Amount,
                    TransactionType = transaction.TransactionType.ToString(),
                    Description = transaction.Description,
                    TransactionDate = transaction.TransactionDate
                };
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}