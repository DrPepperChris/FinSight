using FinSight.Core.Entities;

namespace FinSight.Core.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(ApplicationUser user);
        string CreateRefreshToken();
    }
}