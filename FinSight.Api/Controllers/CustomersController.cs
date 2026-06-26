using FinSight.Core.DTOs;
using FinSight.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSight.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Analyst,Auditor")]
        public async Task<ActionResult<PagedResult<CustomerDto>>> GetCustomers(
            [FromQuery] CustomerQueryParameters query)
        {
            var customers = await _customerService.GetCustomersAsync(query);
            return Ok(customers);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Analyst")]
        public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerRequest request)
        {
            var customer = await _customerService.CreateCustomerAsync(request);
            return CreatedAtAction(nameof(GetCustomers), new { id = customer.Id }, customer);
        }
    }
}