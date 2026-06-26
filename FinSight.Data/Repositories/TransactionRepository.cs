using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using FinSight.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FinSight.Data.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly FinSightDbContext _context;

        public TransactionRepository(FinSightDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(BankTransaction transaction)
        {
            await _context.BankTransactions.AddAsync(transaction);
        }

        public async Task<IEnumerable<BankTransaction>> GetByAccountIdAsync(int accountId)
        {
            return await _context.BankTransactions
                .Where(t => t.AccountId == accountId)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }
    }
}