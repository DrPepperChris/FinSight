using FinSight.Core.DTOs;
using FinSight.Core.Interfaces;

namespace FinSight.Core.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;

        public TransactionService(ITransactionRepository transactionRepository)
        {
            _transactionRepository = transactionRepository;
        }

        public async Task<IEnumerable<TransactionDto>> GetTransactionsByAccountIdAsync(int accountId)
        {
            var transactions = await _transactionRepository.GetByAccountIdAsync(accountId);

            return transactions.Select(t => new TransactionDto
            {
                Id = t.Id,
                AccountId = t.AccountId,
                Amount = t.Amount,
                TransactionType = t.TransactionType.ToString(),
                Description = t.Description,
                TransactionDate = t.TransactionDate
            });
        }
    }
}