using FinSight.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace FinSight.Data.Context
{
    public class FinSightDbContext : DbContext
    {
        public FinSightDbContext(DbContextOptions<FinSightDbContext> options)
            : base(options)
        {
        }

        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Account> Accounts => Set<Account>();
        public DbSet<BankTransaction> BankTransactions => Set<BankTransaction>();
        public DbSet<LoanApplication> LoanApplications => Set<LoanApplication>();
        public DbSet<RiskAssessment> RiskAssessments => Set<RiskAssessment>();
        public DbSet<FraudAlert> FraudAlerts => Set<FraudAlert>();
        public DbSet<ApplicationUser> ApplicationUsers => Set<ApplicationUser>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>()
                .Property(a => a.Balance)
                .HasPrecision(18, 2);

            modelBuilder.Entity<BankTransaction>()
                .Property(t => t.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<LoanApplication>()
                .Property(l => l.RequestedAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ApplicationUser>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<ApplicationUser>()
                .HasIndex(u => u.UserName)
                .IsUnique();

            modelBuilder.Entity<RefreshToken>()
                .HasOne(r => r.ApplicationUser)
                .WithMany()
                .HasForeignKey(r => r.ApplicationUserId);
        }
    }
}