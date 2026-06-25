using FinSight.Core.Entities;

namespace FinSight.Core.Interfaces
{
    public interface ICustomerRepository
    {
        Task<IEnumerable<Customer>> GetAllAsync();
        Task<bool> ExistsAsync(string customerNumber, string email);
        Task<Customer> AddAsync(Customer customer);
    }
}