import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fund-donation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fund-donation.component.html',
  styleUrl: './fund-donation.component.css',
})
export class FundDonationComponent {
  reference = '';
  submitted = signal<boolean>(false);
  confirmMessage = signal<string>('');

  onSubmit(): void {
    if (!this.reference.trim()) return;
    this.confirmMessage.set(
      `Thank you for your generous donation! Your transaction reference "${this.reference.trim()}" has been received. We will verify and confirm shortly.`,
    );
    this.submitted.set(true);
    this.reference = '';
  }
}
