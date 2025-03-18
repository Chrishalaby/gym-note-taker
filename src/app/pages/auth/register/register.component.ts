import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    PasswordModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="flex justify-content-center align-items-center h-screen">
      <p-card
        header="Create an Account"
        styleClass="w-full sm:w-30rem shadow-2"
      >
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <span class="p-float-label w-full">
              <input
                id="email"
                type="email"
                pInputText
                formControlName="email"
                class="w-full"
              />
              <label for="email">Email</label>
            </span>
            <small
              *ngIf="
                registerForm.get('email')?.invalid &&
                registerForm.get('email')?.touched
              "
              class="p-error"
            >
              Email is required and must be valid
            </small>
          </div>

          <div class="mb-3">
            <span class="p-float-label w-full">
              <p-password
                id="password"
                formControlName="password"
                [toggleMask]="true"
                styleClass="w-full"
              ></p-password>
              <label for="password">Password</label>
            </span>
            <small
              *ngIf="
                registerForm.get('password')?.invalid &&
                registerForm.get('password')?.touched
              "
              class="p-error"
            >
              Password is required (min 6 characters)
            </small>
          </div>

          <div class="mb-3">
            <span class="p-float-label w-full">
              <p-password
                id="confirmPassword"
                formControlName="confirmPassword"
                [toggleMask]="true"
                styleClass="w-full"
              ></p-password>
              <label for="confirmPassword">Confirm Password</label>
            </span>
            <small
              *ngIf="
                registerForm.get('confirmPassword')?.invalid &&
                registerForm.get('confirmPassword')?.touched
              "
              class="p-error"
            >
              Confirm password is required
            </small>
            <small
              *ngIf="
                registerForm.hasError('passwordMismatch') &&
                registerForm.get('confirmPassword')?.touched
              "
              class="p-error"
            >
              Passwords do not match
            </small>
          </div>

          <div class="flex flex-column gap-2">
            <p-button
              type="submit"
              label="Register"
              [disabled]="registerForm.invalid || isLoading"
              styleClass="w-full"
            ></p-button>
            <p-button
              type="button"
              label="Back to Login"
              (onClick)="goToLogin()"
              styleClass="p-button-outlined w-full"
            ></p-button>
          </div>
        </form>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;

    try {
      const { email, password } = this.registerForm.value;
      await this.authService.signUp(email, password);

      this.messageService.add({
        severity: 'success',
        summary: 'Registration Successful',
        detail: 'Please check your email for verification.',
      });

      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Registration error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Registration Failed',
        detail: error.message || 'Please try again with different credentials.',
      });
    } finally {
      this.isLoading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
