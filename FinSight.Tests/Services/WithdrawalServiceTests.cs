using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Enums;
using FinSight.Core.Interfaces;
using FinSight.Core.Services;
using FluentAssertions;
using Moq;

namespace FinSight.Tests.Services
{
    public class WithdrawalServiceTests
    {
        [Fact]
        public async Task WithdrawAsync_ShouldThrow_WhenInsufficientFunds()
        {
            var accountRepository = new Mock<IAccountRepository>();
            var transactionRepository = new Mock<ITransactionRepository>();
            var unitOfWork = new Mock<IUnitOfWork>();

            var account = new Account
            {
                Id = 1,
                Status = AccountStatus.Active,
                CurrentBalance = 100m,
                AvailableBalance = 100m
            };

            accountRepository
                .Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(account);

            var service = new WithdrawalService(
                accountRepository.Object,
                transactionRepository.Object,
                unitOfWork.Object);

            var request = new WithdrawalRequest
            {
                Amount = 250m,
                Description = "ATM Withdrawal"
            };

            var action = async () => await service.WithdrawAsync(1, request);

            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Insufficient available balance.");

            transactionRepository.Verify(r => r.AddAsync(It.IsAny<BankTransaction>()), Times.Never);
            unitOfWork.Verify(u => u.BeginTransactionAsync(), Times.Never);
            unitOfWork.Verify(u => u.CommitTransactionAsync(), Times.Never);
        }
    }
}