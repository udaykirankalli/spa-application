import { Component } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  readonly roles: UserRole[] = ['General User', 'Admin'];
  loading = false;
  errorMessage = '';

  readonly loginForm = this.formBuilder.group({
    userId: ['admin01', Validators.required],
    password: ['Admin@123', Validators.required],
    role: ['Admin' as UserRole, Validators.required],
    delayMs: [900, [Validators.min(0), Validators.max(5000)]]
  });

  constructor(
    private readonly formBuilder: NonNullableFormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get userIdInvalid(): boolean {
    const control = this.loginForm.controls.userId;
    return control.invalid && (control.touched || control.dirty);
  }

  get passwordInvalid(): boolean {
    const control = this.loginForm.controls.password;
    return control.invalid && (control.touched || control.dirty);
  }

  get delayInvalid(): boolean {
    const control = this.loginForm.controls.delayMs;
    return control.invalid && (control.touched || control.dirty);
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? 'Login failed. Please check the credentials.';
      }
    });
  }
}
