using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Enums;
using FinSight.Core.Interfaces;
using FinSight.Core.Services;
using FluentAssertions;
using Moq;

namespace FinSight.Tests.Services
{
    public class LoanApplicationServiceTests
    {
        [Fact]
        public async Task ApproveAsync_ShouldThrow_WhenLoanIsNotPending()
        {
            var loanRepository = new Mock<ILoanApplicationRepository>();

            var loan = new LoanApplication
            {
                Id = 1,
                ApplicationNumber = "LOAN-1001",
                RequestedAmount = 15000m,
                LoanType = "Auto",
                Status = LoanStatus.Rejected,
                CustomerId = 8
            };

            loanRepository
                .Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(loan);

            var service = new LoanApplicationService(loanRepository.Object);

            var request = new LoanDecisionRequest
            {
                DecisionReason = "Approved by admin."
            };

            var action = async () => await service.ApproveAsync(1, request);

            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Only pending loan applications can be approved.");

            loanRepository.Verify(r => r.SaveChangesAsync(), Times.Never);
        }
    }
}