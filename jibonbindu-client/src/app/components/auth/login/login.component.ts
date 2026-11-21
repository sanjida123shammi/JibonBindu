import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  showPassword = false;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');
  registeredSuccess = signal<boolean>(false);

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['registered'] === 'true') {
      this.registeredSuccess.set(true);
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe(res => {
      this.isSubmitting.set(false);
      if (res.flag) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.errorMessage.set(res.message);
      }
    });
  }
}