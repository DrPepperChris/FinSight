using FinSight.Core.Validators;
using FinSight.Core.DTOs;
using FluentValidation.TestHelper;

namespace FinSight.Tests.Validators
{
    public class CreateCustomerRequestValidatorTests
    {
        private readonly CreateCustomerRequestValidator _validator = new();

        [Fact]
        public void Should_Have_Error_When_Email_Is_Invalid()
        {
            var model = new CreateCustomerRequest
            {
                CustomerNumber = "CUST-9999",
                FirstName = "Test",
                LastName = "User",
                Email = "not-an-email",
                RiskRating = "Low"
            };

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Email);
        }

        [Fact]
        public void Should_Have_Error_When_RiskRating_Is_Invalid()
        {
            var model = new CreateCustomerRequest
            {
                CustomerNumber = "CUST-9999",
                FirstName = "Test",
                LastName = "User",
                Email = "test.user@demo.com",
                RiskRating = "Extreme"
            };

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.RiskRating);
        }

        [Fact]
        public void Should_Not_Have_Error_When_Request_Is_Valid()
        {
            var model = new CreateCustomerRequest
            {
                CustomerNumber = "CUST-9999",
                FirstName = "Test",
                LastName = "User",
                Email = "test.user@demo.com",
                RiskRating = "Medium"
            };

            var result = _validator.TestValidate(model);

            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}