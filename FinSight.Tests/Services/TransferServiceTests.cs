using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Enums;
using FinSight.Core.Interfaces;
using FinSight.Core.Services;
using FluentAssertions;
using Moq;

namespace FinSight.Tests.Services
{
    public class TransferServiceTests
    {
        [Fact]
        public async Task TransferAsync_ShouldThrow_WhenTransferIsToSameAccount()
        {
            var accountRepository = new Mock<IAccountRepository>();
            var transactionRepository = new Mock<ITransactionRepository>();
            var unitOfWork = new Mock<IUnitOfWork>();

            var service = new TransferService(
                accountRepository.Object,
                transactionRepository.Object,
                unitOfWork.Object);

            var request = new TransferRequest
            {
                FromAccountId = 1,
                ToAccountId = 1,
                Amount = 100m,
                Description = "Same account transfer"
            };

            var action = async () => await service.TransferAsync(request);

            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Cannot transfer to the same account.");

            transactionRepository.Verify(r => r.AddAsync(It.IsAny<BankTransaction>()), Times.Never);
            unitOfWork.Verify(u => u.BeginTransactionAsync(), Times.Never);
        }
    }
}