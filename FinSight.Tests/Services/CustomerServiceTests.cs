using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using FinSight.Core.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace FinSight.Tests.Services
{
    public class CustomerServiceTests
    {
        [Fact]
        public async Task GetCustomersAsync_ShouldReturnCustomerDtos()
        {
            var repository = new Mock<ICustomerRepository>();

            repository.Setup(r => r.GetAllAsync())
                .ReturnsAsync(new List<Customer>
                {
                    new Customer
                    {
                        Id = 1,
                        CustomerNumber = "CUST-1001",
                        FirstName = "Avery",
                        LastName = "Morgan",
                        Email = "avery.morgan@demo.com",
                        RiskRating = "Low"
                    }
                });

            var logger = new Mock<ILogger<CustomerService>>();
            var service = new CustomerService(repository.Object, logger.Object);

            var result = await service.GetCustomersAsync();

            result.Should().ContainSingle();
            result.First().FullName.Should().Be("Avery Morgan");
        }

        [Fact]
        public async Task CreateCustomerAsync_ShouldThrow_WhenCustomerAlreadyExists()
        {
            var repository = new Mock<ICustomerRepository>();

            repository.Setup(r => r.ExistsAsync("CUST-1001", "avery.morgan@demo.com"))
                .ReturnsAsync(true);

            var logger = new Mock<ILogger<CustomerService>>();
            var service = new CustomerService(repository.Object, logger.Object);

            var request = new CreateCustomerRequest
            {
                CustomerNumber = "CUST-1001",
                FirstName = "Avery",
                LastName = "Morgan",
                Email = "avery.morgan@demo.com",
                RiskRating = "Low"
            };

            var action = async () => await service.CreateCustomerAsync(request);

            await action.Should().ThrowAsync<InvalidOperationException>();
        }
    }
}