import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  // Get current user
  getCurrentUser(): Observable<any> {
    return this.supabaseService.currentUser;
  }

  // Sign up new user
  async signUp(email: string, password: string): Promise<any> {
    try {
      const { data, error } = await this.supabaseService.signUp(
        email,
        password
      );
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Sign in existing user
  async signIn(email: string, password: string): Promise<any> {
    try {
      const { data, error } = await this.supabaseService.signIn(
        email,
        password
      );
      if (error) throw error;

      // Redirect to dashboard after successful login
      this.router.navigate(['/dashboard']);
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.supabaseService.currentUser.subscribe((user) => {
        observer.next(!!user);
      });
    });
  }
}
