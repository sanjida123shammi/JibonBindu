export interface SslCommerzInitRequest {
  amount: number;
  donorName: string;
  donorEmail: string;
  donorContactNo: string;
  donorAddress?: string;
  city?: string;
  note?: string;
}

export interface SslCommerzInitResponse {
  success: boolean;
  gatewayUrl?: string;
  tranId?: string;
  message?: string;
}

export interface PaymentReceipt {
  status: 'success' | 'failed' | 'cancelled';
  tranId?: string;
  valId?: string;
  amount?: number;
  method?: string;
  message?: string;
}
