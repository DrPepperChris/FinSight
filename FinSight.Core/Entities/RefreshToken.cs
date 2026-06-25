namespace FinSight.Core.Entities
{
    public class RefreshToken
    {
        public int Id { get; set; }

        public string Token { get; set; } = string.Empty;

        public DateTime ExpiresOn { get; set; }

        public bool IsRevoked { get; set; }

        public int ApplicationUserId { get; set; }

        public ApplicationUser? ApplicationUser { get; set; }
    }
}