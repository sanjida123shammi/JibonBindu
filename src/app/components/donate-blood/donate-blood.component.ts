import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BloodDonorService } from '../../services/blood-donor.service';
import { AuthService } from '../../services/auth.service';
import { BloodDonor, CreateBloodDonorDTO, DonationType } from '../../models/blood-donor.model';

const STORAGE_KEY_PREFIX = 'jbf_donor_id_';

@Component({
  selector: 'app-donate-blood',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './donate-blood.component.html',
  styleUrls: ['../blood-donor/donor-form/donor-form.component.css', './donate-blood.component.css'],
})
export class DonateBloodComponent implements OnInit {
  private donorService = inject(BloodDonorService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // View state: 'FORM' or 'INFO'
  viewState = signal<'FORM' | 'INFO'>('FORM');
  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Saved donor profile for display & editing
  currentDonor = signal<BloodDonor | null>(null);
  donorId: number | null = null;
  donorCode: string = '';

  // Form Fields
  firstName = '';
  lastName = '';
  bloodGroup = 'A+';
  contactNo = '';
  district = 'Dhaka';
  city = 'Dhaka';
  area = 'Uttara';
  address = '';
  dateOfBirth = '2000-01-01';
  lastDonationDate = '';
  lastDonationType: DonationType = 'WholeBlood';
  status = 'Available';
  nextEligibleDate: string | null = null;
  totalDonation = 0;
  donationFromJbf = 0;
  preferredLocation = '';
  preferredTime = 'Anytime';
  remarks = '';
  discontinueStatus: 'IsActive' | 'InActive' = 'IsActive';

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  donationTypes: DonationType[] = ['WholeBlood', 'Plasma', 'Platelets'];

  private get userStorageKey(): string {
    const user = this.authService.activeUser();
    return `${STORAGE_KEY_PREFIX}${user?.id || user?.email || 'guest'}`;
  }

  ngOnInit(): void {
    const savedId = localStorage.getItem(this.userStorageKey);
    if (savedId) {
      this.donorId = Number(savedId);
      this.loadExistingDonor(this.donorId);
    } else {
      // Pre-fill user name if creating for the first time
      const user = this.authService.activeUser();
      if (user?.name) {
        const parts = user.name.split(' ');
        this.firstName = parts[0] || '';
        this.lastName = parts.slice(1).join(' ') || '';
      }
      this.recalculateAvailability();
      this.viewState.set('FORM');
    }
  }

  loadExistingDonor(id: number): void {
    this.isLoading.set(true);
    this.donorService.getDonorById(id).subscribe({
      next: (donor) => {
        if (donor) {
          this.currentDonor.set(donor);
          this.populateFormFields(donor);
          this.viewState.set('INFO');
        } else {
          this.viewState.set('FORM');
        }
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading.set(false);
        this.viewState.set('FORM');
        this.cdr.detectChanges();
      },
    });
  }

  populateFormFields(donor: BloodDonor): void {
    this.donorId = donor.id;
    this.donorCode = donor.donorCode || '';
    this.firstName = donor.firstName || '';
    this.lastName = donor.lastName || '';
    this.bloodGroup = donor.bloodGroup || 'A+';
    this.contactNo = donor.contactNo || '';
    this.district = donor.district || 'Dhaka';
    this.city = donor.city || 'Dhaka';
    this.area = donor.area || '';
    this.address = donor.address || '';
    this.dateOfBirth = donor.dateOfBirth ? donor.dateOfBirth.substring(0, 10) : '2000-01-01';
    this.lastDonationDate = donor.lastDonationDate ? donor.lastDonationDate.substring(0, 10) : '';
    this.lastDonationType = donor.lastDonationType || 'WholeBlood';
    this.status = donor.status || 'Available';
    this.nextEligibleDate = donor.nextEligibleDate ? donor.nextEligibleDate.substring(0, 10) : null;
    this.totalDonation = donor.totalDonation || 0;
    this.donationFromJbf = donor.donationFromJbf || 0;
    this.preferredLocation = donor.preferredLocation || '';
    this.preferredTime = donor.preferredTime || 'Anytime';
    this.remarks = donor.remarks || '';
    this.discontinueStatus = donor.discontinueStatus || 'IsActive';
    this.recalculateAvailability();
  }

  switchToEdit(): void {
    if (this.currentDonor()) {
      this.populateFormFields(this.currentDonor()!);
    }
    this.isEditMode.set(true);
    this.viewState.set('FORM');
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    if (this.currentDonor()) {
      this.viewState.set('INFO');
    } else {
      this.router.navigate(['/dashboard']);
    }
    this.cdr.detectChanges();
  }

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {}
    }
  }

  recalculateAvailability(): void {
    if (!this.lastDonationDate) {
      this.status = 'Available';
      this.nextEligibleDate = null;
      return;
    }

    const last = new Date(this.lastDonationDate);
    if (isNaN(last.getTime())) {
      this.status = 'Available';
      this.nextEligibleDate = null;
      return;
    }

    const intervalDays =
      this.lastDonationType === 'WholeBlood' ? 100 : this.lastDonationType === 'Plasma' ? 28 : 21;

    const nextDate = new Date(last);
    nextDate.setDate(nextDate.getDate() + intervalDays);
    this.nextEligibleDate = nextDate.toISOString().substring(0, 10);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.status = nextDate <= today ? 'Available' : 'Unavailable';
  }

  onDonationDateChange(date: string): void {
    this.lastDonationDate = date;
    this.recalculateAvailability();
    this.cdr.detectChanges();
  }

  onDonationTypeChange(type: DonationType): void {
    this.lastDonationType = type;
    this.recalculateAvailability();
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.errorMessage.set('Please provide first and last name.');
      return;
    }

    const cleanContact = this.contactNo.replace(/[\s-]/g, '').trim();
    if (!cleanContact || !/^\+?[0-9]{11,14}$/.test(cleanContact)) {
      this.errorMessage.set('Contact number must be 11 to 14 digits (e.g. 01711223344).');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload: CreateBloodDonorDTO = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      bloodGroup: this.bloodGroup,
      contactNo: cleanContact,
      district: this.district.trim(),
      city: this.city.trim(),
      area: this.area.trim(),
      address: this.address.trim(),
      dateOfBirth: this.dateOfBirth,
      lastDonationDate: this.lastDonationDate || null,
      lastDonationType: this.lastDonationType,
      status: this.status,
      preferredLocation: this.preferredLocation.trim(),
      preferredTime: this.preferredTime.trim(),
      remarks: this.remarks.trim(),
      totalDonation: Number(this.totalDonation) || 0,
      donationFromJbf: Number(this.donationFromJbf) || 0,
      discontinueStatus: this.discontinueStatus,
    };

    if (this.isEditMode() && this.donorId) {
      // Direct Database Update
      this.donorService.updateDonor(this.donorId, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isEditMode.set(false);
          this.loadExistingDonor(this.donorId!);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update donor info.');
          this.cdr.detectChanges();
        },
      });
    } else {
      // Direct Database Create (No admin notification)
      this.donorService.createDonor(payload).subscribe({
        next: (created) => {
          const newId = created.id;
          localStorage.setItem(this.userStorageKey, String(newId));
          this.donorId = newId;
          this.isSubmitting.set(false);
          this.isEditMode.set(false);
          this.loadExistingDonor(newId);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to register blood donor.');
          this.cdr.detectChanges();
        },
      });
    }
  }
}
