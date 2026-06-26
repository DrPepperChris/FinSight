using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using FinSight.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FinSight.Data.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly FinSightDbContext _context;

        public AccountRepository(FinSightDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<Account>> GetAccountsAsync(AccountQueryParameters query)
        {
            var accountsQuery = _context.Accounts
                .Include(a => a.Customer)
                .AsQueryable();

            if (query.CustomerId.HasValue)
            {
                accountsQuery = accountsQuery.Where(a => a.CustomerId == query.CustomerId.Value);
            }

            if (query.AccountType.HasValue)
            {
                accountsQuery = accountsQuery.Where(a => a.AccountType == query.AccountType.Value);
            }

            if (query.Status.HasValue)
            {
                accountsQuery = accountsQuery.Where(a => a.Status == query.Status.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                accountsQuery = accountsQuery.Where(a =>
                    EF.Functions.Like(a.AccountNumber, $"%{search}%") ||
                    EF.Functions.Like(a.Customer!.FirstName, $"%{search}%") ||
                    EF.Functions.Like(a.Customer!.LastName, $"%{search}%") ||
                    EF.Functions.Like(a.Customer!.Email, $"%{search}%"));
            }

            accountsQuery = query.SortBy.ToLower() switch
            {
                "currentbalance" => query.Descending
                    ? accountsQuery.OrderByDescending(a => a.CurrentBalance)
                    : accountsQuery.OrderBy(a => a.CurrentBalance),

                "availablebalance" => query.Descending
                    ? accountsQuery.OrderByDescending(a => a.AvailableBalance)
                    : accountsQuery.OrderBy(a => a.AvailableBalance),

                "accounttype" => query.Descending
                    ? accountsQuery.OrderByDescending(a => a.AccountType)
                    : accountsQuery.OrderBy(a => a.AccountType),

                "status" => query.Descending
                    ? accountsQuery.OrderByDescending(a => a.Status)
                    : accountsQuery.OrderBy(a => a.Status),

                _ => query.Descending
                    ? accountsQuery.OrderByDescending(a => a.AccountNumber)
                    : accountsQuery.OrderBy(a => a.AccountNumber)
            };

            var totalRecords = await accountsQuery.CountAsync();

            var page = query.Page < 1 ? 1 : query.Page;
            var pageSize = query.PageSize < 1 ? 10 : query.PageSize;
            pageSize = pageSize > 100 ? 100 : pageSize;

            var accounts = await accountsQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Account>
            {
                Items = accounts,
                Page = page,
                PageSize = pageSize,
                TotalRecords = totalRecords
            };
        }

        public async Task<bool> AccountExistsAsync(string accountNumber)
        {
            return await _context.Accounts.AnyAsync(a => a.AccountNumber == accountNumber);
        }

        public async Task<bool> CustomerExistsAsync(int customerId)
        {
            return await _context.Customers.AnyAsync(c => c.Id == customerId);
        }

        public async Task<Account> AddAsync(Account account)
        {
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }
    }
}