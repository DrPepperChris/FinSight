using FinSight.Core.DTOs;

namespace FinSight.Core.Interfaces
{
    public interface IDepositService
    {
        Task<TransactionDto> DepositAsync(int accountId, DepositRequest request);
    }
}