using FinSight.Core.Entities;
using FinSight.Data.Context;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FinSight.Data.Seed
{
    public static class UserSeeder
    {
        public static async Task SeedAsync(FinSightDbContext context)
        {
            var filePath = Path.Combine(
                AppContext.BaseDirectory,
                "Seed",
                "Data",
                "users.json");

            if (!File.Exists(filePath))
            {
                return;
            }

            var json = await File.ReadAllTextAsync(filePath);

            var demoUsers = JsonSerializer.Deserialize<List<ApplicationUser>>(
                json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new List<ApplicationUser>();

            var passwordHasher = new PasswordHasher<ApplicationUser>();

            foreach (var user in demoUsers)
            {
                var exists = await context.ApplicationUsers
                    .AnyAsync(u => u.UserName == user.UserName || u.Email == user.Email);

                if (!exists)
                {
                    user.PasswordHash = passwordHasher.HashPassword(user, "Password123!");
                    context.ApplicationUsers.Add(user);
                }
            }

            await context.SaveChangesAsync();
        }
    }
}