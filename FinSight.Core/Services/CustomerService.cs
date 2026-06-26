using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace FinSight.Core.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(
            ICustomerRepository customerRepository,
            ILogger<CustomerService> logger)
        {
            _customerRepository = customerRepository;
            _logger = logger;
        }

        public async Task<PagedResult<CustomerDto>> GetCustomersAsync(CustomerQueryParameters query)
        {
            _logger.LogInformation("Retrieving customers with search and paging.");

            var pagedCustomers = await _customerRepository.GetCustomersAsync(query);

            return new PagedResult<CustomerDto>
            {
                Items = pagedCustomers.Items.Select(c => new CustomerDto
                {
                    Id = c.Id,
                    CustomerNumber = c.CustomerNumber,
                    FullName = c.FirstName + " " + c.LastName,
                    Email = c.Email,
                    RiskRating = c.RiskRating
                }),
                Page = pagedCustomers.Page,
                PageSize = pagedCustomers.PageSize,
                TotalRecords = pagedCustomers.TotalRecords
            };
        }

        public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request)
        {
            _logger.LogInformation("Creating customer with customer number {CustomerNumber}.", request.CustomerNumber);

            var existingCustomer = await _customerRepository.ExistsAsync(
                request.CustomerNumber,
                request.Email);

            if (existingCustomer)
            {
                _logger.LogWarning("Duplicate customer attempted. CustomerNumber: {CustomerNumber}, Email: {Email}",
                    request.CustomerNumber,
                    request.Email);

                throw new InvalidOperationException(
                    "A customer with this customer number or email already exists.");
            }

            var customer = new Customer
            {
                CustomerNumber = request.CustomerNumber,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                RiskRating = request.RiskRating
            };

            var createdCustomer = await _customerRepository.AddAsync(customer);

            _logger.LogInformation("Customer created successfully. CustomerId: {CustomerId}", createdCustomer.Id);

            return new CustomerDto
            {
                Id = createdCustomer.Id,
                CustomerNumber = createdCustomer.CustomerNumber,
                FullName = createdCustomer.FirstName + " " + createdCustomer.LastName,
                Email = createdCustomer.Email,
                RiskRating = createdCustomer.RiskRating
            };
        }
    }
}