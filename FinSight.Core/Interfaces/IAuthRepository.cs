using FinSight.Core.Entities;

namespace FinSight.Core.Interfaces
{
    public interface IAuthRepository
    {
        Task<ApplicationUser?> GetUserByUserNameOrEmailAsync(string userNameOrEmail);
        Task<bool> UserExistsAsync(string userName, string email);
        Task<ApplicationUser> AddUserAsync(ApplicationUser user);
        Task AddRefreshTokenAsync(RefreshToken refreshToken);
    }
}