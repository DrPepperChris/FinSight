using FinSight.Core.DTOs;

namespace FinSight.Core.Interfaces
{
    public interface ICustomerService
    {
        Task<IEnumerable<CustomerDto>> GetCustomersAsync();
        Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request);
    }
}