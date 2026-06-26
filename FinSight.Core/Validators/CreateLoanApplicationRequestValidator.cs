using FinSight.Core.DTOs;
using FluentValidation;

namespace FinSight.Core.Validators
{
    public class CreateLoanApplicationRequestValidator : AbstractValidator<CreateLoanApplicationRequest>
    {
        public CreateLoanApplicationRequestValidator()
        {
            RuleFor(x => x.RequestedAmount)
                .GreaterThan(0)
                .WithMessage("Requested amount must be greater than zero.");

            RuleFor(x => x.LoanType)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.CustomerId)
                .GreaterThan(0);
        }
    }
}