using FinSight.Core.DTOs;

namespace FinSight.Core.Interfaces
{
    public interface IWithdrawalService
    {
        Task<TransactionDto> WithdrawAsync(int accountId, WithdrawalRequest request);
    }
}