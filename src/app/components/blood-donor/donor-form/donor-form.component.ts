import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BloodDonorService } from '../../../services/blood-donor.service';
import { CreateBloodDonorDTO, DonationType } from '../../../models/blood-donor.model';

@Component({
  selector: 'app-donor-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './donor-form.component.html',
  styleUrl: './donor-form.component.css',
})
export class DonorFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private donorService = inject(BloodDonorService);
  private cdr = inject(ChangeDetectorRef);

  isEditMode = signal<boolean>(false);
  donorId: number | null = null;
  donorCode = '';
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Form Fields matching list1.png & API specifications
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

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.donorId = Number(idParam);
      this.isEditMode.set(true);
      this.loadDonorData(this.donorId);
    } else {
      this.recalculateAvailability();
    }
  }

  loadDonorData(id: number): void {
    this.donorService.getDonorById(id).subscribe({
      next: (item) => {
        if (item) {
          this.donorCode = item.donorCode;
          this.firstName = item.firstName;
          this.lastName = item.lastName;
          this.bloodGroup = item.bloodGroup;
          this.contactNo = item.contactNo;
          this.district = item.district || 'Dhaka';
          this.city = item.city || 'Dhaka';
          this.area = item.area || 'Uttara';
          this.address = item.address;
          this.dateOfBirth = item.dateOfBirth ? item.dateOfBirth.split('T')[0] : '';
          this.lastDonationDate = item.lastDonationDate ? item.lastDonationDate.split('T')[0] : '';
          this.lastDonationType = item.lastDonationType || 'WholeBlood';
          this.totalDonation = item.totalDonation ?? 0;
          this.donationFromJbf = item.donationFromJbf ?? 0;
          this.preferredLocation = item.preferredLocation || '';
          this.preferredTime = item.preferredTime || 'Anytime';
          this.remarks = item.remarks || '';
          this.discontinueStatus = item.discontinueStatus || 'IsActive';
          this.recalculateAvailability();

          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.errorMessage.set('Could not load blood donor details.');
      },
    });
  }

  recalculateAvailability(): void {
    const res = this.donorService.calculateAvailability(
      this.lastDonationDate,
      this.lastDonationType,
    );
    this.status = res.status;
    this.nextEligibleDate = res.nextEligibleDate;
  }

  onDonationDateChange(newDate: string): void {
    this.lastDonationDate = newDate;
    this.recalculateAvailability();
  }

  onDonationTypeChange(newType: DonationType): void {
    this.lastDonationType = newType;
    this.recalculateAvailability();
  }

  openDatePicker(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && typeof (target as any).showPicker === 'function') {
      try {
        (target as any).showPicker();
      } catch {
        // Fallback for browsers without showPicker
      }
    }
  }

  onSubmit(): void {
    if (!this.firstName.trim()) {
      this.errorMessage.set('Please provide the donor first name.');
      return;
    }
    if (!this.contactNo.trim()) {
      this.errorMessage.set('Please provide a valid contact number.');
      return;
    }
    if (!this.dateOfBirth) {
      this.errorMessage.set('Please provide the donor date of birth.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.recalculateAvailability();

    const cleanContact = this.contactNo.trim().replace(/[\s-]/g, '');
    const formattedAddress =
      this.address.trim() ||
      [this.area.trim(), this.city.trim(), this.district.trim()].filter(Boolean).join(', ');

    const payload: CreateBloodDonorDTO = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      bloodGroup: this.bloodGroup,
      contactNo: cleanContact,
      district: this.district.trim(),
      city: this.city.trim(),
      area: this.area.trim(),
      address: formattedAddress,
      dateOfBirth: this.dateOfBirth,
      lastDonationDate: this.lastDonationDate ? this.lastDonationDate : null,
      lastDonationType: this.lastDonationType,
      status: this.status,
      isAvailable: this.status === 'Available',
      totalDonation: Number(this.totalDonation ?? 0),
      donationFromJbf: Number(this.donationFromJbf ?? 0),
      preferredLocation: this.preferredLocation.trim() || 'Any Hospital',
      preferredTime: this.preferredTime.trim() || 'Anytime',
      remarks: this.remarks.trim(),
      discontinueStatus: this.discontinueStatus,
    };

    if (this.isEditMode() && this.donorId) {
      this.donorService
        .updateDonor(this.donorId, {
          ...payload,
          id: this.donorId,
          donorCode: this.donorCode,
          fullName: `${this.firstName.trim()} ${this.lastName.trim()}`.trim(),
          lastDonationType: this.lastDonationType,
        })
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.router.navigate(['/donors']);
          },
          error: (err) => {
            this.isSubmitting.set(false);
            let msg = 'Failed to update blood donor record.';
            if (err?.status === 401) {
              msg = 'Unauthorized (401): Please log in before updating blood donor.';
            } else if (err?.status === 403) {
              msg =
                'Access Denied (403): You need Admin or Member privileges to update blood donors.';
            } else if (err?.status === 400) {
              if (err.error?.errors) {
                msg = Object.values(err.error.errors).flat().join(' ');
              } else if (err.error?.message) {
                msg = err.error.message;
              }
            } else if (err?.error?.message) {
              msg = err.error.message;
            }
            this.errorMessage.set(msg);
            console.error('[DonorForm] Update error:', err);
          },
        });
    } else {
      this.donorService.createDonor(payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/donors']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          let msg = 'Failed to create new blood donor record.';
          if (err?.status === 401) {
            msg = 'Unauthorized (401): Please log in before registering a blood donor.';
          } else if (err?.status === 403) {
            msg =
              'Access Denied (403): Your account role does not have permission to create blood donors (Admin or Member required).';
          } else if (err?.status === 400) {
            if (err.error?.errors) {
              msg = Object.values(err.error.errors).flat().join(' ');
            } else if (err.error?.message) {
              msg = err.error.message;
            }
          } else if (err?.error?.message) {
            msg = err.error.message;
          }
          this.errorMessage.set(msg);
          console.error('[DonorForm] Create error:', err);
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/donors']);
  }
}
