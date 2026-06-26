using FinSight.Core.DTOs;
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

        public async Task<PagedResult<Customer>> GetCustomersAsync(CustomerQueryParameters query)
        {
            var customersQuery = _context.Customers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim().ToLower();

                customersQuery = customersQuery.Where(c =>
                    c.CustomerNumber.ToLower().Contains(search) ||
                    c.FirstName.ToLower().Contains(search) ||
                    c.LastName.ToLower().Contains(search) ||
                    c.Email.ToLower().Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(query.RiskRating))
            {
                var riskRating = query.RiskRating.Trim().ToLower();

                customersQuery = customersQuery.Where(c =>
                    c.RiskRating.ToLower() == riskRating);
            }

            customersQuery = query.SortBy.ToLower() switch
            {
                "firstname" => query.Descending
                    ? customersQuery.OrderByDescending(c => c.FirstName)
                    : customersQuery.OrderBy(c => c.FirstName),

                "customernumber" => query.Descending
                    ? customersQuery.OrderByDescending(c => c.CustomerNumber)
                    : customersQuery.OrderBy(c => c.CustomerNumber),

                "riskrating" => query.Descending
                    ? customersQuery.OrderByDescending(c => c.RiskRating)
                    : customersQuery.OrderBy(c => c.RiskRating),

                _ => query.Descending
                    ? customersQuery.OrderByDescending(c => c.LastName)
                    : customersQuery.OrderBy(c => c.LastName)
            };

            var totalRecords = await customersQuery.CountAsync();

            var page = query.Page < 1 ? 1 : query.Page;
            var pageSize = query.PageSize < 1 ? 10 : query.PageSize;
            pageSize = pageSize > 100 ? 100 : pageSize;

            var customers = await customersQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Customer>
            {
                Items = customers,
                Page = page,
                PageSize = pageSize,
                TotalRecords = totalRecords
            };
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