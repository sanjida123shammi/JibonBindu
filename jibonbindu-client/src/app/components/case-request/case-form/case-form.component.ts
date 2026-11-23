import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CaseRequestService } from '../../../services/case-request.service';
import { CreateCaseRequestDTO } from '../../../models/case-request.model';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './case-form.component.html',
  styleUrl: './case-form.component.css',
})
export class CaseFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private caseService = inject(CaseRequestService);
  private cdr = inject(ChangeDetectorRef);
  readonly themeService = inject(ThemeService);
  
  t(key: string): string {
    return this.themeService.translate(key);
  }

  isEditMode = signal<boolean>(false);
  caseId: number | null = null;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Form Fields matching user image columns
  date = ''; // Current creation date
  patientProblem = '';
  bloodGroup = 'O+';
  bloodQuantity = 1;
  hemoglobin = 10.0;
  donationDate = ''; // Target donation date
  donationTime = '10:00 AM';
  donationPlace = ''; // Hospital / Location
  contactNo = '';
  reference = ''; // Source or person the case is from
  remarks = ''; // Remarks column
  status = 'Pending'; // Case Status dropdown
  isYourCase = true;

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  availableStatuses: string[] = [];

  ngOnInit(): void {
    const today = new Date();
    this.date = today.toISOString().split('T')[0];

    // Default donation target date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.donationDate = tomorrow.toISOString().split('T')[0];

    this.availableStatuses = this.caseService.availableStatuses;

    // Check if editing an existing case
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.caseId = Number(idParam);
      this.isEditMode.set(true);
      this.loadCaseData(this.caseId);
    }
  }

  loadCaseData(id: number): void {
    this.caseService.getCaseById(id).subscribe({
      next: (item) => {
        if (item) {
          this.date = item.date ? item.date.split('T')[0] : this.date;
          this.patientProblem = item.patientProblem;
          this.bloodGroup = item.bloodGroup;
          this.bloodQuantity = item.bloodQuantity;
          this.hemoglobin = item.hemoglobin;
          this.donationDate = item.donationDate
            ? item.donationDate.split('T')[0]
            : this.donationDate;
          this.donationTime = item.donationTime || '10:00 AM';
          this.donationPlace = item.donationPlace;
          this.contactNo = item.contactNo;
          this.reference = item.reference || '';
          this.remarks = item.remarks || '';
          this.status = item.status || 'Pending';
          this.isYourCase = item.isYourCase ?? true;

          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.errorMessage.set('Could not load case details.');
      },
    });
  }

  /**
   * Open native calendar picker immediately when clicked
   */
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
    if (!this.patientProblem.trim()) {
      this.errorMessage.set('Please specify the patient problem / condition.');
      return;
    }
    if (!this.donationPlace.trim()) {
      this.errorMessage.set('Please specify the donation place / hospital name.');
      return;
    }
    if (!this.contactNo.trim()) {
      this.errorMessage.set('Please provide a valid contact phone number.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // Normalize phone number (strip whitespace and hyphens for backend regex ^\+?[0-9]{11,14}$)
    const cleanContact = this.contactNo.trim().replace(/[\s-]/g, '');

    const payload: CreateCaseRequestDTO = {
      date: this.date,
      patientProblem: this.patientProblem.trim(),
      bloodGroup: this.bloodGroup,
      bloodQuantity: Number(this.bloodQuantity),
      hemoglobin: Number(this.hemoglobin),
      donationDate: this.donationDate,
      donationTime: this.donationTime,
      donationPlace: this.donationPlace.trim(),
      contactNo: cleanContact,
      reference: this.reference.trim() || 'Self / Patient Family',
      remarks: this.remarks.trim(),
      status: this.status,
      isYourCase: this.isYourCase,
    };

    if (this.isEditMode() && this.caseId) {
      this.caseService.updateCase(this.caseId, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/cases']);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set('Failed to update case request.');
        },
      });
    } else {
      this.caseService.createCase(payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          // this.router.navigate(['/cases']);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set('Failed to create case request.');
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/cases']);
  }
}
