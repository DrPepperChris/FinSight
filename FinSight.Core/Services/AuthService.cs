using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace FinSight.Core.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly ITokenService _tokenService;
        private readonly PasswordHasher<ApplicationUser> _passwordHasher = new();

        public AuthService(
            IAuthRepository authRepository,
            ITokenService tokenService)
        {
            _authRepository = authRepository;
            _tokenService = tokenService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var exists = await _authRepository.UserExistsAsync(request.UserName, request.Email);

            if (exists)
            {
                throw new InvalidOperationException("A user with this username or email already exists.");
            }

            var user = new ApplicationUser
            {
                UserName = request.UserName,
                Email = request.Email,
                Role = request.Role
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            var createdUser = await _authRepository.AddUserAsync(user);

            var refreshToken = _tokenService.CreateRefreshToken();

            await _authRepository.AddRefreshTokenAsync(new RefreshToken
            {
                Token = refreshToken,
                ApplicationUserId = createdUser.Id,
                ExpiresOn = DateTime.UtcNow.AddDays(7)
            });

            return new AuthResponse
            {
                Token = _tokenService.CreateToken(createdUser),
                RefreshToken = refreshToken,
                UserName = createdUser.UserName,
                Email = createdUser.Email,
                Role = createdUser.Role
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _authRepository.GetUserByUserNameOrEmailAsync(request.UserNameOrEmail);

            if (user == null || !user.IsActive)
            {
                throw new UnauthorizedAccessException("Invalid username/email or password.");
            }

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedAccessException("Invalid username/email or password.");
            }

            var refreshToken = _tokenService.CreateRefreshToken();

            await _authRepository.AddRefreshTokenAsync(new RefreshToken
            {
                Token = refreshToken,
                ApplicationUserId = user.Id,
                ExpiresOn = DateTime.UtcNow.AddDays(7)
            });

            return new AuthResponse
            {
                Token = _tokenService.CreateToken(user),
                RefreshToken = refreshToken,
                UserName = user.UserName,
                Email = user.Email,
                Role = user.Role
            };
        }
    }
}