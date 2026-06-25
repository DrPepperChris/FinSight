using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using FinSight.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FinSight.Data.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly FinSightDbContext _context;

        public CustomerRepository(FinSightDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Customer>> GetAllAsync()
        {
            return await _context.Customers
                .OrderBy(c => c.LastName)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(string customerNumber, string email)
        {
            return await _context.Customers
                .AnyAsync(c => c.CustomerNumber == customerNumber || c.Email == email);
        }

        public async Task<Customer> AddAsync(Customer customer)
        {
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return customer;
        }
    }
}