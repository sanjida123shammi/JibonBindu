import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SslCommerzService } from '../../services/sslcommerz.service';
import { PaymentReceipt, SslCommerzInitRequest } from '../../models/sslcommerz.model';

@Component({
  selector: 'app-fund-donation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fund-donation.component.html',
  styleUrl: './fund-donation.component.css',
})
export class FundDonationComponent implements OnInit {
  private sslService = inject(SslCommerzService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Quick Preset Amounts (in BDT)
  readonly presetAmounts = [100, 500, 1000, 2000, 5000];

  // Donation Form State
  donationData: SslCommerzInitRequest = {
    amount: 500,
    donorName: '',
    donorEmail: '',
    donorContactNo: '', // <-- Aligned property
    donorAddress: 'Dhaka',
    city: 'Dhaka',
    note: '',
  };

  isCustomAmount = false;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Payment Callback Status State
  paymentResult = signal<PaymentReceipt | null>(null);

  ngOnInit(): void {
    // Read response parameters returned by the API after SSLCOMMERZ redirection
    this.route.queryParams.subscribe((params) => {
      const status = params['status'];
      if (status) {
        this.paymentResult.set({
          status: status as 'success' | 'failed' | 'cancelled',
          tranId: params['tranId'],
          valId: params['valId'],
          amount: params['amount'] ? Number(params['amount']) : undefined,
          method: params['method'],
          message: params['message'],
        });
      }
    });
  }

  selectAmount(amount: number): void {
    this.donationData.amount = amount;
    this.isCustomAmount = false;
  }

  enableCustomAmount(): void {
    this.isCustomAmount = true;
    this.donationData.amount = 0;
  }

  onPayOnline(): void {
    if (!this.donationData.amount || this.donationData.amount < 10) {
      this.errorMessage.set('Please specify a valid donation amount (minimum ৳10).');
      return;
    }
    if (!this.donationData.donorName.trim()) {
      this.errorMessage.set('Please enter your full name.');
      return;
    }
    if (!this.donationData.donorEmail.trim()) {
      this.errorMessage.set('Please enter your email address.');
      return;
    }
    if (!this.donationData.donorContactNo.trim()) {
      this.errorMessage.set('Please enter your contact number.');
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.sslService.initiatePayment(this.donationData).subscribe({
      next: (res) => {
        if (res.success && res.gatewayUrl) {
          // Redirect the browser directly to the SSLCOMMERZ hosted checkout page
          window.location.href = res.gatewayUrl;
        } else {
          this.isSubmitting.set(false);
          this.errorMessage.set(res.message || 'Failed to initialize payment gateway.');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.error?.message || 'Server error occurred while connecting to SSLCOMMERZ.',
        );
      },
    });
  }

  resetForm(): void {
    this.paymentResult.set(null);
    this.router.navigate([], { queryParams: {} });
  }

  printReceipt(): void {
    window.print();
  }
}
