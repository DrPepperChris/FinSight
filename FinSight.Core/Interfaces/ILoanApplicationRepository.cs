using FinSight.Core.DTOs;
using FinSight.Core.Entities;

namespace FinSight.Core.Interfaces
{
    public interface ILoanApplicationRepository
    {
        Task<PagedResult<LoanApplication>> GetLoansAsync(LoanQueryParameters query);
        Task<LoanApplication?> GetByIdAsync(int id);
        Task<bool> CustomerExistsAsync(int customerId);
        Task<LoanApplication> AddAsync(LoanApplication loanApplication);
        Task SaveChangesAsync();
    }
}