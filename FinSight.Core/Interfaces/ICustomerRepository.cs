using FinSight.Core.DTOs;
using FinSight.Core.Entities;

namespace FinSight.Core.Interfaces
{
    public interface ICustomerRepository
    {
        Task<PagedResult<Customer>> GetCustomersAsync(CustomerQueryParameters query);
        Task<bool> ExistsAsync(string customerNumber, string email);
        Task<Customer> AddAsync(Customer customer);
    }
}