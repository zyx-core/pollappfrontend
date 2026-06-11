import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="auth-root">
      <!-- Left decoration panel -->
      <div class="auth-deco">
        <div class="deco-inner">
          <div class="deco-icon-wrap">
            <mat-icon>assessment</mat-icon>
          </div>
          <h2 class="deco-title">Welcome Back</h2>
          <p class="deco-sub">Access your dashboard to cast your vote and view real-time standings.</p>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="auth-form-panel">
        <div class="auth-form-wrap">

          <div class="auth-logo">
            <div class="auth-logo-orb"><mat-icon>assessment</mat-icon></div>
            <span class="auth-logo-text">Global <span>POLLS</span></span>
          </div>

          <h1 class="auth-title">Sign In</h1>
          <p class="auth-sub">Enter your credentials to access your account.</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">

            <!-- Email -->
            <div class="field-group">
              <label class="field-label">Email Address</label>
              <div class="field-input-wrap" [class.field-error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                <mat-icon class="field-icon">email</mat-icon>
                <input
                  type="email"
                  formControlName="email"
                  id="login-email"
                  placeholder="you@example.com"
                  class="field-input"
                  autocomplete="email">
              </div>
              <span *ngIf="loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched" class="field-error-text">
                Email is required
              </span>
            </div>

            <!-- Password -->
            <div class="field-group">
              <label class="field-label">Password</label>
              <div class="field-input-wrap" [class.field-error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                <mat-icon class="field-icon">lock</mat-icon>
                <input
                  [type]="hidePassword() ? 'password' : 'text'"
                  formControlName="password"
                  id="login-password"
                  placeholder="Enter your password"
                  class="field-input"
                  autocomplete="current-password">
                <button type="button" class="field-eye-btn" (click)="hidePassword.set(!hidePassword())">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <span *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched" class="field-error-text">
                Password is required
              </span>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="btn-flat btn-flat-primary auth-submit-btn"
              [class.loading]="isLoading()"
              [disabled]="loginForm.invalid || isLoading()">
              <mat-spinner *ngIf="isLoading()" [diameter]="20" style="margin:0 auto;"></mat-spinner>
              <span *ngIf="!isLoading()" style="display:flex; align-items:center; gap:8px;">
                <mat-icon>login</mat-icon> Sign In
              </span>
            </button>
          </form>

          <p class="auth-footer-text">
            Don't have an account?
            <a routerLink="/register" class="auth-link">Create one here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .auth-root {
      display: flex;
      min-height: calc(100vh - 64px);
    }

    /* === LEFT DECORATION === */
    .auth-deco {
      display: none;
      width: 40%;
      max-width: 500px;
      flex-shrink: 0;
      background-color: var(--brand-primary);
      color: #fff;
      padding: 48px;

      @media (min-width: 900px) { display: flex; align-items: center; justify-content: center; }
    }

    .deco-inner {
      text-align: center;
      max-width: 320px;
    }

    .deco-icon-wrap {
      width: 80px; height: 80px;
      border-radius: var(--radius-lg);
      background-color: rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 32px;
      border: 1px solid rgba(255,255,255,0.2);

      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #fff; }
    }

    .deco-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 16px;
      line-height: 1.2;
    }

    .deco-sub {
      font-size: 1.05rem;
      opacity: 0.8;
      line-height: 1.6;
    }

    /* === RIGHT FORM PANEL === */
    .auth-form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      background-color: var(--bg-base);
    }

    .auth-form-wrap {
      width: 100%;
      max-width: 400px;
    }

    .auth-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 48px;

      @media (min-width: 900px) { display: none; }
    }

    .auth-logo-orb {
      width: 36px; height: 36px;
      border-radius: var(--radius-sm);
      background-color: var(--brand-primary);
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: #fff; font-size: 20px; width: 20px; height: 20px; }
    }

    .auth-logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--text-primary);
      span { color: var(--brand-primary); }
    }

    .auth-title {
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .auth-sub {
      color: var(--text-muted);
      margin-bottom: 32px;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .field-input-wrap {
      display: flex;
      align-items: center;
      background-color: var(--bg-surface);
      border: 1px solid var(--bg-elevated);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: border-color 0.2s ease;

      &:focus-within { border-color: var(--brand-primary); }
      &.field-error { border-color: var(--color-danger); }
    }

    .field-icon {
      color: var(--text-muted);
      font-size: 20px; width: 20px; height: 20px;
      margin: 0 12px;
    }

    .field-input {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text-primary);
      padding: 14px 0;
      outline: none;
      font-family: inherit;
      font-size: 1rem;

      &::placeholder { color: var(--text-muted); opacity: 0.5; }
    }

    .field-eye-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0 12px;
      display: flex; align-items: center;

      &:hover { color: var(--text-primary); }
    }

    .field-error-text {
      font-size: 0.8rem;
      color: var(--color-danger);
    }

    .auth-submit-btn {
      margin-top: 12px;
      width: 100%;
      height: 48px;

      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .auth-footer-text {
      margin-top: 32px;
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .auth-link {
      color: var(--brand-primary);
      font-weight: 600;
      margin-left: 4px;
      &:hover { text-decoration: underline; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup;
  isLoading = signal<boolean>(false);
  hidePassword = signal<boolean>(true);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.success) {
            this.snackBar.open(res.message, 'Close', { duration: 3000 });
            if (res.data.role === 'Admin') {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else {
            this.snackBar.open(res.message, 'Close', { duration: 4000 });
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.snackBar.open(err.message || 'Login failed.', 'Close', { duration: 4000 });
        }
      });
    }
  }
}
