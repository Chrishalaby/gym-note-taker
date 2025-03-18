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
  selector: 'app-login',
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
      <p-card header="Login" styleClass="w-full sm:w-30rem shadow-2">
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
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
                loginForm.get('email')?.invalid &&
                loginForm.get('email')?.touched
              "
              class="p-error"
            >
              Email is required
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
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched
              "
              class="p-error"
            >
              Password is required
            </small>
          </div>

          <div class="flex flex-column gap-2">
            <p-button
              type="submit"
              label="Login"
              [disabled]="loginForm.invalid || isLoading"
              styleClass="w-full"
            ></p-button>
            <p-button
              type="button"
              label="Create an account"
              (onClick)="goToRegister()"
              styleClass="p-button-outlined w-full"
            ></p-button>
          </div>
        </form>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    try {
      const { email, password } = this.loginForm.value;
      await this.authService.signIn(email, password);
      // Navigation is handled in the authService
    } catch (error: any) {
      console.error('Login error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: error.message || 'Please check your credentials and try again.',
      });
    } finally {
      this.isLoading = false;
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
