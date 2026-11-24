using System.Text.Json;
using SharedLibrary.DTOs;

namespace Api.Services
{
    public class SslCommerzService : ISslCommerzService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ILogger<SslCommerzService> _logger;

        public SslCommerzService(
            HttpClient httpClient,
            IConfiguration config,
            ILogger<SslCommerzService> logger)
        {
            _httpClient = httpClient;
            _config = config;
            _logger = logger;
        }

        public async Task<SslCommerzInitResponse> InitiatePaymentAsync(SslCommerzInitRequest request)
        {
            var isSandbox = _config.GetValue<bool>("SslCommerzSettings:IsSandbox");
            var storeId = _config["SslCommerzSettings:StoreId"];
            var storePassword = _config["SslCommerzSettings:StorePassword"];
            var apiBaseUrl = _config["SslCommerzSettings:BaseUrl"] ?? "http://localhost:5127";

            var sessionUrl = isSandbox
                ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
                : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

            var tranId = $"JB-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

            var postData = new Dictionary<string, string>
            {
                { "store_id", storeId ?? "" },
                { "store_passwd", storePassword ?? "" },
                { "total_amount", request.Amount.ToString("F2") },
                { "currency", "BDT" },
                { "tran_id", tranId },
                { "success_url", $"{apiBaseUrl}/api/sslcommerz/success" },
                { "fail_url", $"{apiBaseUrl}/api/sslcommerz/fail" },
                { "cancel_url", $"{apiBaseUrl}/api/sslcommerz/cancel" },
                { "ipn_url", $"{apiBaseUrl}/api/sslcommerz/ipn" },

                // Customer info
                { "cus_name", request.DonorName },
                { "cus_email", request.DonorEmail },
                { "cus_add1", request.DonorAddress ?? "Dhaka" },
                { "cus_city", request.City ?? "Dhaka" },
                { "cus_country", "Bangladesh" },
                { "cus_phone", request.DonorContactNo },

                // Product info
                { "product_name", "Donation to Jibonbindu Foundation" },
                { "product_category", "Donation" },
                { "product_profile", "non-physical-goods" },
                { "shipping_method", "NO" },
                { "num_of_item", "1" },

                // Custom parameters to carry metadata through the gateway
                { "value_a", request.DonorName },
                { "value_b", request.DonorEmail },
                { "value_c", request.DonorContactNo },
                { "value_d", request.Note ?? "Online Fund Donation" }
            };

            try
            {
                var content = new FormUrlEncodedContent(postData);
                var response = await _httpClient.PostAsync(sessionUrl, content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("SSLCOMMERZ session init failed with status: {StatusCode}", response.StatusCode);
                    return new SslCommerzInitResponse { Success = false, Message = "Unable to connect to payment gateway." };
                }

                var responseString = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<SslCommerzGatewayInitResult>(responseString);

                if (result?.status == "SUCCESS" && !string.IsNullOrEmpty(result.GatewayPageURL))
                {
                    return new SslCommerzInitResponse
                    {
                        Success = true,
                        GatewayUrl = result.GatewayPageURL,
                        TranId = tranId
                    };
                }

                return new SslCommerzInitResponse
                {
                    Success = false,
                    Message = result?.failedreason ?? "Gateway rejected session initiation."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception while initiating SSLCOMMERZ session");
                return new SslCommerzInitResponse { Success = false, Message = ex.Message };
            }
        }

        public async Task<bool> ValidatePaymentAsync(string valId)
        {
            var isSandbox = _config.GetValue<bool>("SslCommerzSettings:IsSandbox");
            var storeId = _config["SslCommerzSettings:StoreId"];
            var storePassword = _config["SslCommerzSettings:StorePassword"];

            var validatorUrl = isSandbox
                ? $"https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id={valId}&store_id={storeId}&store_passwd={storePassword}&v=1&format=json"
                : $"https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id={valId}&store_id={storeId}&store_passwd={storePassword}&v=1&format=json";

            try
            {
                var response = await _httpClient.GetAsync(validatorUrl);
                if (!response.IsSuccessStatusCode) return false;

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<SslCommerzValidatorResponse>(content);

                return result?.status == "VALID" || result?.status == "VALIDATED";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate SSLCOMMERZ transaction {ValId}", valId);
                return false;
            }
        }
    }
}