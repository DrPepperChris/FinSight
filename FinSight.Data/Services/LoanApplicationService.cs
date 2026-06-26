using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Enums;
using FinSight.Core.Interfaces;

namespace FinSight.Core.Services
{
    public class LoanApplicationService : ILoanApplicationService
    {
        private readonly ILoanApplicationRepository _loanRepository;

        public LoanApplicationService(ILoanApplicationRepository loanRepository)
        {
            _loanRepository = loanRepository;
        }

        public async Task<PagedResult<LoanApplicationDto>> GetLoansAsync(LoanQueryParameters query)
        {
            var pagedLoans = await _loanRepository.GetLoansAsync(query);

            return new PagedResult<LoanApplicationDto>
            {
                Items = pagedLoans.Items.Select(MapToDto),
                Page = pagedLoans.Page,
                PageSize = pagedLoans.PageSize,
                TotalRecords = pagedLoans.TotalRecords
            };
        }

        public async Task<LoanApplicationDto> CreateLoanApplicationAsync(CreateLoanApplicationRequest request)
        {
            if (request.RequestedAmount <= 0)
                throw new InvalidOperationException("Requested amount must be greater than zero.");

            if (!await _loanRepository.CustomerExistsAsync(request.CustomerId))
                throw new InvalidOperationException("Customer does not exist.");

            var loan = new LoanApplication
            {
                ApplicationNumber = $"LOAN-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                RequestedAmount = request.RequestedAmount,
                LoanType = request.LoanType,
                Status = LoanStatus.Pending,
                ApplicationDate = DateTime.UtcNow,
                CustomerId = request.CustomerId
            };

            var createdLoan = await _loanRepository.AddAsync(loan);

            return MapToDto(createdLoan);
        }

        public async Task<LoanApplicationDto> ApproveAsync(int id, LoanDecisionRequest request)
        {
            var loan = await _loanRepository.GetByIdAsync(id);

            if (loan == null)
                throw new InvalidOperationException("Loan application does not exist.");

            if (loan.Status != LoanStatus.Pending)
                throw new InvalidOperationException("Only pending loan applications can be approved.");

            loan.Status = LoanStatus.Approved;
            loan.DecisionDate = DateTime.UtcNow;
            loan.DecisionReason = request.DecisionReason;
            
            //Used for DB rollback
            await _loanRepository.SaveChangesAsync();

            return MapToDto(loan);
        }

        public async Task<LoanApplicationDto> RejectAsync(int id, LoanDecisionRequest request)
        {
            var loan = await _loanRepository.GetByIdAsync(id);

            if (loan == null)
                throw new InvalidOperationException("Loan application does not exist.");

            if (loan.Status != LoanStatus.Pending)
                throw new InvalidOperationException("Only pending loan applications can be rejected.");

            loan.Status = LoanStatus.Rejected;
            loan.DecisionDate = DateTime.UtcNow;
            loan.DecisionReason = request.DecisionReason;

            //Used for DB rollback
            await _loanRepository.SaveChangesAsync();

            return MapToDto(loan);
        }

        private static LoanApplicationDto MapToDto(LoanApplication loan)
        {
            return new LoanApplicationDto
            {
                Id = loan.Id,
                ApplicationNumber = loan.ApplicationNumber,
                RequestedAmount = loan.RequestedAmount,
                LoanType = loan.LoanType,
                Status = loan.Status,
                ApplicationDate = loan.ApplicationDate,
                DecisionDate = loan.DecisionDate,
                DecisionReason = loan.DecisionReason,
                CustomerId = loan.CustomerId,
                CustomerName = loan.Customer == null
                    ? string.Empty
                    : loan.Customer.FirstName + " " + loan.Customer.LastName
            };
        }
    }
}