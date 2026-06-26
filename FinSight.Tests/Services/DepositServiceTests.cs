using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Enums;
using FinSight.Core.Interfaces;
using FinSight.Core.Services;
using FluentAssertions;
using Moq;

namespace FinSight.Tests.Services
{
    public class DepositServiceTests
    {
        [Fact]
        public async Task DepositAsync_ShouldIncreaseBalances_AndCreateTransaction()
        {
            var accountRepository = new Mock<IAccountRepository>();
            var transactionRepository = new Mock<ITransactionRepository>();
            var unitOfWork = new Mock<IUnitOfWork>();

            var account = new Account
            {
                Id = 1,
                AccountNumber = "CHK-100001",
                AccountType = AccountType.Checking,
                Status = AccountStatus.Active,
                CurrentBalance = 1000m,
                AvailableBalance = 1000m
            };

            accountRepository
                .Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(account);

            var service = new DepositService(
                accountRepository.Object,
                transactionRepository.Object,
                unitOfWork.Object);

            var request = new DepositRequest
            {
                Amount = 250m,
                Description = "Payroll Deposit"
            };

            var result = await service.DepositAsync(1, request);

            account.CurrentBalance.Should().Be(1250m);
            account.AvailableBalance.Should().Be(1250m);

            result.Amount.Should().Be(250m);
            result.TransactionType.Should().Be("Deposit");

            transactionRepository.Verify(
                r => r.AddAsync(It.Is<BankTransaction>(t =>
                    t.AccountId == 1 &&
                    t.Amount == 250m &&
                    t.TransactionType == TransactionType.Deposit &&
                    t.BalanceAfterTransaction == 1250m)),
                Times.Once);

            unitOfWork.Verify(u => u.BeginTransactionAsync(), Times.Once);
            unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
            unitOfWork.Verify(u => u.CommitTransactionAsync(), Times.Once);
            unitOfWork.Verify(u => u.RollbackTransactionAsync(), Times.Never);
        }
    }
}