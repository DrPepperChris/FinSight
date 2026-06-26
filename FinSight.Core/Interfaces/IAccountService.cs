using FinSight.Core.DTOs;

namespace FinSight.Core.Interfaces
{
    public interface IAccountService
    {
        Task<PagedResult<AccountDto>> GetAccountsAsync(AccountQueryParameters query);
        Task<AccountDto> CreateAccountAsync(CreateAccountRequest request);
    }
}