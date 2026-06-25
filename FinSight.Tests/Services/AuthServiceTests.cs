using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using FinSight.Core.Services;
using FluentAssertions;
using Moq;

namespace FinSight.Tests.Services
{
    public class AuthServiceTests
    {
        [Fact]
        public async Task RegisterAsync_ShouldThrow_WhenUserAlreadyExists()
        {
            var authRepository = new Mock<IAuthRepository>();
            var tokenService = new Mock<ITokenService>();

            authRepository
                .Setup(r => r.UserExistsAsync("admin", "admin@finsight.demo"))
                .ReturnsAsync(true);

            var service = new AuthService(authRepository.Object, tokenService.Object);

            var request = new RegisterRequest
            {
                UserName = "admin",
                Email = "admin@finsight.demo",
                Password = "Password123!",
                Role = "Admin"
            };

            var action = async () => await service.RegisterAsync(request);

            await action.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async Task RegisterAsync_ShouldReturnAuthResponse_WhenUserIsNew()
        {
            var authRepository = new Mock<IAuthRepository>();
            var tokenService = new Mock<ITokenService>();

            authRepository
                .Setup(r => r.UserExistsAsync("analyst", "analyst@finsight.demo"))
                .ReturnsAsync(false);

            authRepository
                .Setup(r => r.AddUserAsync(It.IsAny<ApplicationUser>()))
                .ReturnsAsync((ApplicationUser user) =>
                {
                    user.Id = 1;
                    return user;
                });

            tokenService
                .Setup(t => t.CreateToken(It.IsAny<ApplicationUser>()))
                .Returns("jwt-token");

            tokenService
                .Setup(t => t.CreateRefreshToken())
                .Returns("refresh-token");

            var service = new AuthService(authRepository.Object, tokenService.Object);

            var request = new RegisterRequest
            {
                UserName = "analyst",
                Email = "analyst@finsight.demo",
                Password = "Password123!",
                Role = "Analyst"
            };

            var result = await service.RegisterAsync(request);

            result.Token.Should().Be("jwt-token");
            result.RefreshToken.Should().Be("refresh-token");
            result.UserName.Should().Be("analyst");
            result.Role.Should().Be("Analyst");

            authRepository.Verify(r => r.AddRefreshTokenAsync(It.IsAny<RefreshToken>()), Times.Once);
        }

        [Fact]
        public async Task LoginAsync_ShouldThrow_WhenUserDoesNotExist()
        {
            var authRepository = new Mock<IAuthRepository>();
            var tokenService = new Mock<ITokenService>();

            authRepository
                .Setup(r => r.GetUserByUserNameOrEmailAsync("missing"))
                .ReturnsAsync((ApplicationUser?)null);

            var service = new AuthService(authRepository.Object, tokenService.Object);

            var request = new LoginRequest
            {
                UserNameOrEmail = "missing",
                Password = "Password123!"
            };

            var action = async () => await service.LoginAsync(request);

            await action.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnAuthResponse_WhenCredentialsAreValid()
        {
            var authRepository = new Mock<IAuthRepository>();
            var tokenService = new Mock<ITokenService>();

            var serviceForHashing = new Microsoft.AspNetCore.Identity.PasswordHasher<ApplicationUser>();

            var user = new ApplicationUser
            {
                Id = 1,
                UserName = "admin",
                Email = "admin@finsight.demo",
                Role = "Admin",
                IsActive = true
            };

            user.PasswordHash = serviceForHashing.HashPassword(user, "Password123!");

            authRepository
                .Setup(r => r.GetUserByUserNameOrEmailAsync("admin"))
                .ReturnsAsync(user);

            tokenService
                .Setup(t => t.CreateToken(It.IsAny<ApplicationUser>()))
                .Returns("jwt-token");

            tokenService
                .Setup(t => t.CreateRefreshToken())
                .Returns("refresh-token");

            var service = new AuthService(authRepository.Object, tokenService.Object);

            var request = new LoginRequest
            {
                UserNameOrEmail = "admin",
                Password = "Password123!"
            };

            var result = await service.LoginAsync(request);

            result.Token.Should().Be("jwt-token");
            result.RefreshToken.Should().Be("refresh-token");
            result.UserName.Should().Be("admin");
            result.Role.Should().Be("Admin");

            authRepository.Verify(r => r.AddRefreshTokenAsync(It.IsAny<RefreshToken>()), Times.Once);
        }

        [Fact]
        public async Task LoginAsync_ShouldThrow_WhenCredentialsAreNotValid()
        {
            var authRepository = new Mock<IAuthRepository>();
            var tokenService = new Mock<ITokenService>();

            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<ApplicationUser>();

            var user = new ApplicationUser
            {
                Id = 1,
                UserName = "admin",
                Email = "admin@finsight.demo",
                Role = "Admin",
                IsActive = true
            };

            user.PasswordHash = passwordHasher.HashPassword(user, "Password123!");

            authRepository
                .Setup(r => r.GetUserByUserNameOrEmailAsync("admin"))
                .ReturnsAsync(user);

            var service = new AuthService(authRepository.Object, tokenService.Object);

            var request = new LoginRequest
            {
                UserNameOrEmail = "admin",
                Password = "WrongPassword123!"
            };

            var action = async () => await service.LoginAsync(request);

            await action.Should().ThrowAsync<UnauthorizedAccessException>();

            tokenService.Verify(t => t.CreateToken(It.IsAny<ApplicationUser>()), Times.Never);
            tokenService.Verify(t => t.CreateRefreshToken(), Times.Never);
            authRepository.Verify(r => r.AddRefreshTokenAsync(It.IsAny<RefreshToken>()), Times.Never);
        }
    }
}