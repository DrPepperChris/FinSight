using FinSight.Core.DTOs;

namespace FinSight.Core.Interfaces
{
    public interface ILoanApplicationService
    {
        Task<PagedResult<LoanApplicationDto>> GetLoansAsync(LoanQueryParameters query);
        Task<LoanApplicationDto> CreateLoanApplicationAsync(CreateLoanApplicationRequest request);
        Task<LoanApplicationDto> ApproveAsync(int id, LoanDecisionRequest request);
        Task<LoanApplicationDto> RejectAsync(int id, LoanDecisionRequest request);
    }
}