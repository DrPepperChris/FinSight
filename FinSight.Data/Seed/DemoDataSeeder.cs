using FinSight.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FinSight.Data.Seed
{
    public static class DemoDataSeeder
    {
        public static async Task SeedAsync(FinSightDbContext context)
        {
            await context.Database.MigrateAsync();

            await UserSeeder.SeedAsync(context);
            await CustomerSeeder.SeedAsync(context);
        }
    }
}