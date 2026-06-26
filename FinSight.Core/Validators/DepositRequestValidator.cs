using FinSight.Core.DTOs;
using FluentValidation;

namespace FinSight.Core.Validators
{
    public class DepositRequestValidator : AbstractValidator<DepositRequest>
    {
        public DepositRequestValidator()
        {
            RuleFor(x => x.Amount)
                .GreaterThan(0)
                .WithMessage("Deposit amount must be greater than zero.");

            RuleFor(x => x.Description)
                .MaximumLength(200);
        }
    }
}