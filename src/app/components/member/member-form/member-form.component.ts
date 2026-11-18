import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MemberService, PersonRoleOption } from '../../../services/member.service';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './member-form.component.html',
  styleUrl: './member-form.component.css',
})
export class MemberFormComponent implements OnInit {
  private memberService = inject(MemberService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isEditMode = signal<boolean>(false);
  memberId: string | null = null;
  isSubmitting = signal<boolean>(false);
  isUploadingImage = signal<boolean>(false);
  errorMessage = signal<string>('');
  previewUrl = signal<string>('');

  get displayImageUrl(): string {
    if (this.previewUrl()) return this.previewUrl();
    return this.memberService.getImageUrl(this.imageUrl);
  }

  firstName: string = '';
  lastName: string = '';
  dateOfBirth: string = '';
  contactNumber: string = '';
  district: string = 'Dhaka';
  city: string = 'Dhaka';
  area: string = '';
  nidNumber: string = '';
  birthCertificateNo: string = '';
  email: string = '';
  imageUrl: string = '';
  personRoleId: number = 0;

  roles = signal<PersonRoleOption[]>([]);

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
    this.loadRoles();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.memberId = idParam;
      this.isEditMode.set(true);
      this.loadMember(idParam);
    }
  }

  loadRoles(): void {
    this.memberService.getPersonRoles().subscribe({
      next: (roleList) => {
        const filtered = roleList.filter(
          (r) => !r.personRoleName.toLowerCase().includes('blood donor'),
        );
        this.roles.set(filtered.length > 0 ? filtered : roleList);

        if (!this.personRoleId && this.roles().length > 0) {
          this.personRoleId = this.roles()[0].personRoleId;
        }
      },
      error: (err) => console.error('[MemberForm] Failed to load person roles:', err),
    });
  }

  loadMember(id: string): void {
    this.memberService.getMemberById(id).subscribe({
      next: (m) => {
        if (m) {
          this.firstName = m.firstName;
          this.lastName = m.lastName;
          this.dateOfBirth = m.dateOfBirth ? m.dateOfBirth.substring(0, 10) : '';
          this.contactNumber = m.contactNumber;
          this.district = m.district;
          this.city = m.city;
          this.area = m.area;
          this.nidNumber = m.nidNumber || '';
          this.birthCertificateNo = m.birthCertificateNo || '';
          this.imageUrl = m.imageUrl || '';
          this.previewUrl.set('');
          this.personRoleId = m.personRoleID;

          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.errorMessage.set(`Member '${id}' not found on server.`);
      },
    });
  }

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        // Fallback for browsers without showPicker support
      }
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Instant local preview for smooth UI feedback
      this.previewUrl.set(URL.createObjectURL(file));
      this.isUploadingImage.set(true);
      this.errorMessage.set('');

      this.memberService.uploadImage(file).subscribe({
        next: (resp) => {
          this.imageUrl = resp.imageUrl; // Store server path (e.g., /images/members/xxx.png)
          this.isUploadingImage.set(false);
        },
        error: (err) => {
          this.isUploadingImage.set(false);
          this.errorMessage.set(
            err?.error?.message || 'Failed to upload image to server. Please try again.',
          );
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

    if (!this.dateOfBirth) {
      this.errorMessage.set('Please provide the date of birth.');
      return;
    }

    if (!this.nidNumber.trim() && !this.birthCertificateNo.trim()) {
      this.errorMessage.set(
        'A member must provide either an NID Number or a Birth Certificate Number.',
      );
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const dto = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      dateOfBirth: new Date(this.dateOfBirth + 'T00:00:00').toISOString(),
      contactNumber: cleanContact,
      district: this.district.trim(),
      city: this.city.trim(),
      area: this.area.trim(),
      nidNumber: this.nidNumber.trim() || undefined,
      birthCertificateNo: this.birthCertificateNo.trim() || undefined,
      email: this.email.trim() || undefined,
      imageUrl: this.imageUrl || undefined,
      personRoleId: Number(this.personRoleId) || undefined,
    };

    if (this.isEditMode() && this.memberId) {
      this.memberService.updateMember(this.memberId, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/members']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            err?.error?.message || err?.error?.error || 'Failed to update member profile.',
          );
        },
      });
    } else {
      this.memberService.createMember(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/members']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            err?.error?.message || err?.error?.error || 'Failed to register member.',
          );
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/members']);
  }
}
