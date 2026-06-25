using FinSight.Core.Entities;
using FinSight.Data.Context;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FinSight.Data.Seed
{
    public static class CustomerSeeder
    {
        public static async Task SeedAsync(FinSightDbContext context)
        {
            var filePath = Path.Combine(
                AppContext.BaseDirectory,
                "Seed",
                "Data",
                "customers.json");

            if (!File.Exists(filePath))
            {
                return;
            }

            var json = await File.ReadAllTextAsync(filePath);

            var demoCustomers = JsonSerializer.Deserialize<List<Customer>>(
                json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new List<Customer>();

            foreach (var customer in demoCustomers)
            {
                var exists = await context.Customers
                    .AnyAsync(c =>
                        c.CustomerNumber == customer.CustomerNumber ||
                        c.Email == customer.Email);

                if (!exists)
                {
                    context.Customers.Add(customer);
                }
            }

            await context.SaveChangesAsync();
        }
    }
}