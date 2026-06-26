using FinSight.Core.Entities;

namespace FinSight.Core.Interfaces
{
    public interface ITransactionRepository
    {
        Task AddAsync(BankTransaction transaction);

        Task<IEnumerable<BankTransaction>> GetByAccountIdAsync(int accountId);
    }
}