using FinSight.Core.DTOs;
using FinSight.Core.Entities;

namespace FinSight.Core.Interfaces
{
    public interface IAccountRepository
    {
        Task<PagedResult<Account>> GetAccountsAsync(AccountQueryParameters query);
        Task<bool> AccountExistsAsync(string accountNumber);
        Task<bool> CustomerExistsAsync(int customerId);
        Task<Account> AddAsync(Account account);
    }
}