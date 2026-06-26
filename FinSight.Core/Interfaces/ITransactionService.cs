using FinSight.Core.DTOs;

namespace FinSight.Core.Interfaces
{
    public interface ITransactionService
    {
        Task<IEnumerable<TransactionDto>> GetTransactionsByAccountIdAsync(int accountId);
    }
}