import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  readonly profileService = inject(UserProfileService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  fullName = '';
  email = '';
  mobileNumber = '';
  location = 'Dhaka, Bangladesh';
  avatarUrl = signal<string>('');

  showPasswordSection = signal<boolean>(false);
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  saveSuccessMessage = signal<string | null>(null);
  saveErrorMessage = signal<string | null>(null);
  isSaving = signal<boolean>(false);

  get displayAvatarUrl(): string {
    return this.profileService.getImageUrl(this.avatarUrl());
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (data: UserProfile) => {
        this.fullName = data.fullName || '';
        this.email = data.email || '';
        this.mobileNumber = data.phoneNumber || '';
        this.location = data.location || 'Dhaka, Bangladesh';
        if (data.avatarUrl) {
          this.avatarUrl.set(data.avatarUrl);
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saveErrorMessage.set(err?.error?.message || 'Could not load profile.');
      },
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Instant local preview
      this.avatarUrl.set(URL.createObjectURL(file));

      this.profileService.uploadAvatar(file).subscribe({
        next: (resp) => {
          this.avatarUrl.set(resp.avatarUrl);
          this.saveSuccessMessage.set('Profile photo updated successfully!');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.saveErrorMessage.set(err?.error?.message || 'Failed to upload profile photo.');
          this.cdr.detectChanges();
        },
      });
    }
  }

  onSaveChanges(): void {
    this.isSaving.set(true);
    this.saveSuccessMessage.set(null);
    this.saveErrorMessage.set(null);

    this.profileService
      .updateProfile({
        fullName: this.fullName.trim(),
        phoneNumber: this.mobileNumber.trim(),
        location: this.location.trim() || 'Dhaka, Bangladesh',
        avatarUrl: this.avatarUrl(),
      })
      .subscribe({
        next: () => {
          if (this.currentPassword || this.newPassword) {
            this.profileService
              .changePassword({
                currentPassword: this.currentPassword,
                newPassword: this.newPassword,
                confirmPassword: this.confirmPassword,
              })
              .subscribe({
                next: () => {
                  this.isSaving.set(false);
                  this.saveSuccessMessage.set(
                    'Profile and password updated successfully in database!',
                  );
                  this.currentPassword = '';
                  this.newPassword = '';
                  this.confirmPassword = '';
                  this.showPasswordSection.set(false);
                  this.cdr.detectChanges();
                },
                error: (pErr) => {
                  this.isSaving.set(false);
                  this.saveErrorMessage.set(pErr?.error?.message || 'Failed to update password.');
                  this.cdr.detectChanges();
                },
              });
          } else {
            this.isSaving.set(false);
            this.saveSuccessMessage.set('Profile changes saved successfully in database!');
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.isSaving.set(false);
          this.saveErrorMessage.set(err?.error?.message || 'Failed to save profile changes.');
          this.cdr.detectChanges();
        },
      });
  }

  closeProfile(): void {
    this.router.navigate(['/dashboard']);
  }

  togglePasswordSection(): void {
    this.showPasswordSection.update((v) => !v);
  }

  onLogout(): void {
    this.profileService.logout();
    this.router.navigate(['/login']);
  }
}
