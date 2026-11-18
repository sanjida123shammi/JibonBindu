import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'jbf_member_request_sent';

@Component({
  selector: 'app-want-to-be-member',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './want-to-be-member.component.html',
  styleUrls: [
    '../member/member-form/member-form.component.css',
    './want-to-be-member.component.css',
  ],
})
export class WantToBeMemberComponent implements OnInit {
  private memberService = inject(MemberService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  alreadySent = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isUploadingImage = signal<boolean>(false);
  errorMessage = signal<string>('');
  previewUrl = signal<string>('');

  get displayImageUrl(): string {
    if (this.previewUrl()) return this.previewUrl();
    return this.memberService.getImageUrl(this.imageUrl);
  }

  firstName = '';
  lastName = '';
  dateOfBirth = '';
  contactNumber = '';
  district = 'Dhaka';
  area = '';
  nidNumber = '';
  birthCertificateNo = '';
  email = '';
  imageUrl = '';

  districts: string[] = [
    'Dhaka',
    'Gazipur',
    'Narayanganj',
    'Chattogram',
    'Sylhet',
    'Rajshahi',
    'Khulna',
    'Barishal',
    'Rangpur',
    'Mymensingh',
  ];

  ngOnInit(): void {
    const user = this.authService.activeUser();
    if (user) {
      if (user.name) {
        const parts = user.name.split(' ');
        this.firstName = parts[0] || '';
        this.lastName = parts.slice(1).join(' ') || '';
      }
      this.email = user.email || '';
    }

    const userId = user?.id ?? 'guest';
    if (localStorage.getItem(`${STORAGE_KEY}_${userId}`) === 'true') {
      this.alreadySent.set(true);
    }
  }

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {}
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.previewUrl.set(URL.createObjectURL(file));
      this.isUploadingImage.set(true);
      this.errorMessage.set('');

      this.memberService.uploadImage(file).subscribe({
        next: (resp) => {
          this.imageUrl = resp.imageUrl;
          this.isUploadingImage.set(false);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isUploadingImage.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to upload image.');
        },
      });
    }
  }

  onSubmit(): void {
    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.errorMessage.set('Please provide both first and last name.');
      return;
    }

    const cleanContact = this.contactNumber.replace(/[\s-]/g, '').trim();
    if (!cleanContact || !/^\+?[0-9]{11,14}$/.test(cleanContact)) {
      this.errorMessage.set('Contact number must be 11 to 14 digits (e.g. 01711223344).');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const fullName = `${this.firstName.trim()} ${this.lastName.trim()}`.trim();
    const payload = {
      name: fullName,
      contactNumber: cleanContact,
      email: this.email.trim() || undefined,
    };

    this.http
      .post<{ flag: boolean; message: string }>(
        `${environment.apiUrl}/members/request-membership`,
        payload,
      )
      .subscribe({
        next: () => {
          const userId = this.authService.activeUser()?.id ?? 'guest';
          localStorage.setItem(`${STORAGE_KEY}_${userId}`, 'true');
          this.isSubmitting.set(false);
          this.alreadySent.set(true);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to send request.');
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
