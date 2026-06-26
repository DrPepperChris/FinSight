using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Enums;
using FinSight.Core.Interfaces;

namespace FinSight.Core.Services
{
    public class TransferService : ITransferService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IUnitOfWork _unitOfWork;

        public TransferService(
            IAccountRepository accountRepository,
            ITransactionRepository transactionRepository,
            IUnitOfWork unitOfWork)
        {
            _accountRepository = accountRepository;
            _transactionRepository = transactionRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<TransactionDto>> TransferAsync(TransferRequest request)
        {
           
            if (request.FromAccountId == request.ToAccountId)
                throw new InvalidOperationException("Cannot transfer to the same account.");

            var fromAccount = await _accountRepository.GetByIdAsync(request.FromAccountId);
            var toAccount = await _accountRepository.GetByIdAsync(request.ToAccountId);

            if (fromAccount == null || toAccount == null)
                throw new InvalidOperationException("One or both accounts do not exist.");

            if (fromAccount.Status != AccountStatus.Active || toAccount.Status != AccountStatus.Active)
                throw new InvalidOperationException("Transfers can only be made between active accounts.");

            if (fromAccount.AvailableBalance < request.Amount)
                throw new InvalidOperationException("Insufficient available balance.");

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                fromAccount.CurrentBalance -= request.Amount;
                fromAccount.AvailableBalance -= request.Amount;

                toAccount.CurrentBalance += request.Amount;
                toAccount.AvailableBalance += request.Amount;

                var referenceNumber = Guid.NewGuid().ToString("N");
                var timestamp = DateTime.UtcNow;

                var debitTransaction = new BankTransaction
                {
                    AccountId = fromAccount.Id,
                    Amount = request.Amount,
                    TransactionType = TransactionType.TransferOut,
                    Description = request.Description,
                    BalanceAfterTransaction = fromAccount.CurrentBalance,
                    TransactionDate = timestamp,
                    TransactionNumber = $"TFO-{timestamp:yyyyMMddHHmmssfff}",
                    ReferenceNumber = referenceNumber
                };

                var creditTransaction = new BankTransaction
                {
                    AccountId = toAccount.Id,
                    Amount = request.Amount,
                    TransactionType = TransactionType.TransferIn,
                    Description = request.Description,
                    BalanceAfterTransaction = toAccount.CurrentBalance,
                    TransactionDate = timestamp,
                    TransactionNumber = $"TFI-{timestamp:yyyyMMddHHmmssfff}",
                    ReferenceNumber = referenceNumber
                };

                await _transactionRepository.AddAsync(debitTransaction);
                await _transactionRepository.AddAsync(creditTransaction);

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return new List<TransactionDto>
                {
                    MapToDto(debitTransaction),
                    MapToDto(creditTransaction)
                };
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        private static TransactionDto MapToDto(BankTransaction transaction)
        {
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
    }
}