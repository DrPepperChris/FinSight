using FinSight.Core.DTOs;
using FluentValidation;

namespace FinSight.Core.Validators
{
    public class TransferRequestValidator : AbstractValidator<TransferRequest>
    {
        public TransferRequestValidator()
        {
            RuleFor(x => x.FromAccountId)
                .GreaterThan(0);

            RuleFor(x => x.ToAccountId)
                .GreaterThan(0);

            RuleFor(x => x.Amount)
                .GreaterThan(0)
                .WithMessage("Transfer amount must be greater than zero.");

            RuleFor(x => x)
                .Must(x => x.FromAccountId != x.ToAccountId)
                .WithMessage("Cannot transfer to the same account.");

            RuleFor(x => x.Description)
                .MaximumLength(200);
        }
    }
}