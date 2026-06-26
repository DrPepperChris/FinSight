using FinSight.Core.DTOs;
using FluentValidation;

namespace FinSight.Core.Validators
{
    public class WithdrawalRequestValidator : AbstractValidator<WithdrawalRequest>
    {
        public WithdrawalRequestValidator()
        {
            RuleFor(x => x.Amount)
                .GreaterThan(0)
                .WithMessage("Withdrawal amount must be greater than zero.");

            RuleFor(x => x.Description)
                .MaximumLength(200);
        }
    }
}