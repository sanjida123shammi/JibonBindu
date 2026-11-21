import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FundService } from '../../../services/fund.service';

@Component({
  selector: 'app-deposit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './deposit-form.component.html',
  styleUrl: './deposit-form.component.css',
})
export class DepositFormComponent implements OnInit {
  private fundService = inject(FundService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isEditMode = signal<boolean>(false);
  depositId: number | null = null;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Dropdown options
  donorTypes: { id: number; name: string }[] = [];
  fundingTypes: { id: number; name: string }[] = [];
  cashTypes: { id: number; name: string }[] = [];

  // Form Model
  fundDonationDate: string = new Date().toISOString().substring(0, 10);
  fundDonorTypeId: number = 1;
  donorName: string = '';
  donorContactNo: string = '';
  fundDonorId: number | null = null;
  amount: number = 1000;
  fundReceiver: string = 'Adrita';
  fundingTypeId: number = 1;
  cashTypeId: number = 1;
  months: string = '';

  ngOnInit(): void {
    const now = new Date();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.months = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    // Load lookups (donorTypes, fundingTypes, cashTypes)
    this.fundService.getLookups().subscribe((resp) => {
      this.donorTypes = resp.donorTypes || [];
      this.fundingTypes = resp.fundingTypes || [];
      this.cashTypes = resp.cashTypes || [];

      if (this.donorTypes.length > 0 && !this.isEditMode()) {
        this.fundDonorTypeId = this.donorTypes[0].id;
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.depositId = parseInt(idParam, 10);
      if (this.depositId) {
        this.isEditMode.set(true);
        this.loadDepositData(this.depositId);
      }
    }
  }

  loadDepositData(id: number): void {
    this.fundService.getDepositById(id).subscribe((dep) => {
      if (dep) {
        this.fundDonationDate = dep.fundDonationDate.substring(0, 10);
        this.fundDonorTypeId = dep.fundDonorTypeId || 1;
        this.donorName = dep.donorName || '';
        this.donorContactNo = dep.donorContactNo || '';
        this.fundDonorId = dep.fundDonorId || null;
        this.amount = dep.amount;
        this.fundReceiver = dep.fundReceiver || '';
        this.fundingTypeId = dep.fundingTypeId;
        this.cashTypeId = dep.cashTypeId;
        this.months = dep.months;

        this.cdr.detectChanges();
      } else {
        this.errorMessage.set(`Deposit #${id} could not be loaded.`);
      }
    });
  }

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        // Fallback for older browsers
      }
    }
  }

  onSubmit(): void {
    if (!this.donorName.trim()) {
      this.errorMessage.set('Please provide the donor name.');
      return;
    }

    if (!this.fundDonationDate || !this.amount || this.amount <= 0) {
      this.errorMessage.set('Please provide a valid donation date and positive amount.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const dto = {
      fundDonationDate: new Date(this.fundDonationDate).toISOString(),
      fundDonorTypeId: Number(this.fundDonorTypeId),
      fundDonorId: this.fundDonorId ? Number(this.fundDonorId) : undefined,
      donorName: this.donorName.trim(),
      donorContactNo: this.donorContactNo.trim(),
      amount: Number(this.amount),
      fundReceiver: this.fundReceiver.trim(),
      fundingTypeId: Number(this.fundingTypeId),
      cashTypeId: Number(this.cashTypeId),
      months: this.months.trim(),
    };

    if (this.isEditMode() && this.depositId) {
      this.fundService.updateDeposit(this.depositId, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/funds/deposits']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update deposit record.');
        },
      });
    } else {
      this.fundService.createDeposit(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/funds/deposits']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to register new fund deposit.');
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/funds/deposits']);
  }
}
