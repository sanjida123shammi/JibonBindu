using SharedLibrary.DTOs;

namespace Api.Services
{
    public interface ISslCommerzService
    {
        Task<SslCommerzInitResponse> InitiatePaymentAsync(SslCommerzInitRequest request);
        Task<bool> ValidatePaymentAsync(string valId);
    }
}