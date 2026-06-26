using FinSight.Core.DTOs;

namespace FinSight.Core.Interfaces
{
    public interface ITransferService
    {
        Task<IEnumerable<TransactionDto>> TransferAsync(TransferRequest request);
    }
}