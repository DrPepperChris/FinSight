using FinSight.Core.DTOs;

namespace FinSight.Core.Interfaces
{
    public interface ICustomerService
    {
        Task<PagedResult<CustomerDto>> GetCustomersAsync(CustomerQueryParameters query);
        Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request);
    }
}