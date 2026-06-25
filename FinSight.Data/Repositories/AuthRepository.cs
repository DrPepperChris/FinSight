using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using FinSight.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FinSight.Data.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly FinSightDbContext _context;

        public AuthRepository(FinSightDbContext context)
        {
            _context = context;
        }

        public async Task<ApplicationUser?> GetUserByUserNameOrEmailAsync(string userNameOrEmail)
        {
            return await _context.ApplicationUsers
                .FirstOrDefaultAsync(u =>
                    u.UserName == userNameOrEmail ||
                    u.Email == userNameOrEmail);
        }

        public async Task<bool> UserExistsAsync(string userName, string email)
        {
            return await _context.ApplicationUsers
                .AnyAsync(u => u.UserName == userName || u.Email == email);
        }

        public async Task<ApplicationUser> AddUserAsync(ApplicationUser user)
        {
            _context.ApplicationUsers.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task AddRefreshTokenAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
        }
    }
}