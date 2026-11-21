import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  acceptedPolicy = false;
  selectedRole = 'Seeker';

  isBusy = signal<boolean>(false);
  errorMessage = signal<string>('');

  onSubmit(): void {
    this.errorMessage.set('');

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return;
    }
    if (!this.acceptedPolicy) {
      this.errorMessage.set('You must accept the terms to proceed.');
      return;
    }

    this.isBusy.set(true);
    this.auth
      .register({
        name: this.fullName.trim(),
        email: this.email.trim(),
        password: this.password,
        confirmPassword: this.confirmPassword,
        role: this.selectedRole,
      })
      .subscribe((res) => {
        this.isBusy.set(false);
        if (res.flag) {
          this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
        } else {
          this.errorMessage.set(res.message);
        }
      });
  }
}
