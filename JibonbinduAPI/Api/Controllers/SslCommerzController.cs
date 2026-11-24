using Api.Data;
using Api.Repositories;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.DTOs;
using SharedLibrary.Models;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SslCommerzController : ControllerBase
    {
        private readonly ISslCommerzService _sslService;
        private readonly IFundDepositRepository _fundDeposits;
        private readonly JBFIdentityDbContext _context;
        private readonly IConfiguration _config;
        private readonly ILogger<SslCommerzController> _logger;

        public SslCommerzController(
            ISslCommerzService sslService,
            IFundDepositRepository fundDeposits,
            JBFIdentityDbContext context,
            IConfiguration config,
            ILogger<SslCommerzController> logger)
        {
            _sslService = sslService;
            _fundDeposits = fundDeposits;
            _context = context;
            _config = config;
            _logger = logger;
        }

        /// <summary>
        /// Initiates an online donation payment session.
        /// </summary>
        [HttpPost("initiate")]
        [AllowAnonymous] // Allows public supporters as well as logged in users to donate
        public async Task<ActionResult<SslCommerzInitResponse>> Initiate([FromBody] SslCommerzInitRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _sslService.InitiatePaymentAsync(request);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Callback URL invoked by SSLCOMMERZ on successful payment.
        /// </summary>
        [HttpPost("success")]
        [AllowAnonymous]
        [Consumes("application/x-www-form-urlencoded")]
        public async Task<IActionResult> PaymentSuccess([FromForm] SslCommerzCallbackDTO callback)
        {
            var frontendUrl = _config["SslCommerzSettings:FrontendReturnUrl"] ?? "http://localhost:4200/fund-donation";

            if (string.IsNullOrEmpty(callback.val_id))
            {
                return Redirect($"{frontendUrl}?status=failed&message=Invalid+Payment+Response");
            }

            // 1. Verify transaction with SSLCOMMERZ Order Validation API
            var isValid = await _sslService.ValidatePaymentAsync(callback.val_id);
            if (!isValid)
            {
                _logger.LogWarning("Payment validation failed for ValId: {ValId}, TranId: {TranId}", callback.val_id, callback.tran_id);
                return Redirect($"{frontendUrl}?status=failed&message=Payment+Validation+Failed");
            }

            // 2. Record donation in database via FundDepositRepository
            try
            {
                // 2 = "By Bkash", 3 = "By Nagad", fallback to 2
                var cashTypeId = 2;
                if (!string.IsNullOrEmpty(callback.card_type) && callback.card_type.Contains("NAGAD", StringComparison.OrdinalIgnoreCase))
                {
                    cashTypeId = 3;
                }

                // 2 = "Others" / One-time donation
                var fundingTypeId = await _context.FundingTypes.Select(f => f.FundingTypeId).FirstOrDefaultAsync();
                if (fundingTypeId == 0) fundingTypeId = 2;

                var depositDto = new FundDepositDTO
                {
                    FundDonationDate = DateTime.Today,
                    DonorName = !string.IsNullOrWhiteSpace(callback.value_a) ? callback.value_a : "Online Donor",
                    DonorContactNo = callback.value_c,
                    Amount = callback.amount,
                    FundReceiver = $"SSLCOMMERZ ({callback.card_type ?? "Online"}) - Tran: {callback.tran_id}{(string.IsNullOrWhiteSpace(callback.value_b) ? "" : $" - {callback.value_b}")}",
                    FundingTypeId = fundingTypeId,
                    CashTypeId = cashTypeId,
                    Months = DateTime.Today.ToString("MMMM yyyy")
                };

                await _fundDeposits.AddAsync(depositDto);
                _logger.LogInformation("Donation record created successfully for TranId {TranId}", callback.tran_id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save fund deposit for successful transaction {TranId}", callback.tran_id);
            }

            // 3. Redirect back to Angular client with query params
            var redirectUrl = $"{frontendUrl}?status=success&tranId={callback.tran_id}&valId={callback.val_id}&amount={callback.amount}&method={callback.card_type}";
            return Redirect(redirectUrl);
        }

        /// <summary>
        /// Callback URL invoked by SSLCOMMERZ on payment failure.
        /// </summary>
        [HttpPost("fail")]
        [AllowAnonymous]
        [Consumes("application/x-www-form-urlencoded")]
        public IActionResult PaymentFail([FromForm] SslCommerzCallbackDTO callback)
        {
            var frontendUrl = _config["SslCommerzSettings:FrontendReturnUrl"] ?? "http://localhost:4200/fund-donation";
            var message = Uri.EscapeDataString(callback.error ?? "Payment failed or was declined.");
            return Redirect($"{frontendUrl}?status=failed&tranId={callback.tran_id}&message={message}");
        }

        /// <summary>
        /// Callback URL invoked by SSLCOMMERZ when the user cancels payment.
        /// </summary>
        [HttpPost("cancel")]
        [AllowAnonymous]
        [Consumes("application/x-www-form-urlencoded")]
        public IActionResult PaymentCancel([FromForm] SslCommerzCallbackDTO callback)
        {
            var frontendUrl = _config["SslCommerzSettings:FrontendReturnUrl"] ?? "http://localhost:4200/fund-donation";
            return Redirect($"{frontendUrl}?status=cancelled&tranId={callback.tran_id}");
        }

        /// <summary>
        /// Instant Payment Notification (IPN) webhook listener.
        /// </summary>
        [HttpPost("ipn")]
        [AllowAnonymous]
        [Consumes("application/x-www-form-urlencoded")]
        public async Task<IActionResult> PaymentIpn([FromForm] SslCommerzCallbackDTO callback)
        {
            if (string.IsNullOrEmpty(callback.val_id)) return BadRequest();

            var isValid = await _sslService.ValidatePaymentAsync(callback.val_id);
            if (isValid)
            {
                _logger.LogInformation("IPN verified successfully for TranId: {TranId}", callback.tran_id);
                return Ok(new { message = "IPN Received & Verified" });
            }

            return BadRequest(new { message = "Validation Failed" });
        }
    }
}