using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using FinSight.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FinSight.Data.Repositories
{
    public class LoanApplicationRepository : ILoanApplicationRepository
    {
        private readonly FinSightDbContext _context;

        public LoanApplicationRepository(FinSightDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<LoanApplication>> GetLoansAsync(LoanQueryParameters query)
        {
            var loansQuery = _context.LoanApplications
                .Include(l => l.Customer)
                .AsQueryable();

            if (query.CustomerId.HasValue)
                loansQuery = loansQuery.Where(l => l.CustomerId == query.CustomerId.Value);

            if (query.Status.HasValue)
                loansQuery = loansQuery.Where(l => l.Status == query.Status.Value);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                loansQuery = loansQuery.Where(l =>
                    EF.Functions.Like(l.ApplicationNumber, $"%{search}%") ||
                    EF.Functions.Like(l.LoanType, $"%{search}%") ||
                    EF.Functions.Like(l.Customer!.FirstName, $"%{search}%") ||
                    EF.Functions.Like(l.Customer!.LastName, $"%{search}%"));
            }

            loansQuery = query.SortBy.ToLower() switch
            {
                "requestedamount" => query.Descending
                    ? loansQuery.OrderByDescending(l => l.RequestedAmount)
                    : loansQuery.OrderBy(l => l.RequestedAmount),

                "status" => query.Descending
                    ? loansQuery.OrderByDescending(l => l.Status)
                    : loansQuery.OrderBy(l => l.Status),

                _ => query.Descending
                    ? loansQuery.OrderByDescending(l => l.ApplicationDate)
                    : loansQuery.OrderBy(l => l.ApplicationDate)
            };

            var totalRecords = await loansQuery.CountAsync();

            var page = query.Page < 1 ? 1 : query.Page;
            var pageSize = query.PageSize < 1 ? 10 : query.PageSize;
            pageSize = pageSize > 100 ? 100 : pageSize;

            var loans = await loansQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<LoanApplication>
            {
                Items = loans,
                Page = page,
                PageSize = pageSize,
                TotalRecords = totalRecords
            };
        }

        public async Task<LoanApplication?> GetByIdAsync(int id)
        {
            return await _context.LoanApplications
                .Include(l => l.Customer)
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task<bool> CustomerExistsAsync(int customerId)
        {
            return await _context.Customers.AnyAsync(c => c.Id == customerId);
        }

        public async Task<LoanApplication> AddAsync(LoanApplication loanApplication)
        {
            _context.LoanApplications.Add(loanApplication);
            await _context.SaveChangesAsync();
            return loanApplication;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}