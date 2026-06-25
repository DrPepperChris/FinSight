using FinSight.Core.DTOs;
using FluentValidation;
using FinSight.Core.Validators;

namespace FinSight.Core.Validators
{
    public class CreateCustomerRequestValidator : AbstractValidator<CreateCustomerRequest>
    {
        public CreateCustomerRequestValidator()
        {
            RuleFor(x => x.CustomerNumber).NotEmpty().MaximumLength(25);
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(100);

            RuleFor(x => x.RiskRating)
                .NotEmpty()
                .Must(x => x == "Low" || x == "Medium" || x == "High")
                .WithMessage("RiskRating must be Low, Medium, or High.");
        }
    }
}