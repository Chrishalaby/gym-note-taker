import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    // Check if user is already logged in
    this.supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        this.currentUserSubject.next(data.session.user);
      }
    });

    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        this.currentUserSubject.next(session.user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  // Authentication methods
  async signUp(email: string, password: string): Promise<any> {
    return this.supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string): Promise<any> {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut(): Promise<any> {
    return this.supabase.auth.signOut();
  }

  // Database operations
  async getWorkouts(): Promise<any> {
    const user = this.currentUserSubject.value;
    if (!user)
      return { data: null, error: new Error('User not authenticated') };

    return this.supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
  }

  async saveWorkout(workout: any): Promise<any> {
    const user = this.currentUserSubject.value;
    if (!user)
      return { data: null, error: new Error('User not authenticated') };

    // Clean up the workout object to prevent database errors
    const workoutData = { ...workout };
    workoutData.user_id = user.id;

    // Make sure we're using a Date object for the date field
    if (workoutData.date && typeof workoutData.date !== 'string') {
      workoutData.date = workoutData.date.toISOString();
    }

    if (workoutData.id) {
      return this.supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', workoutData.id)
        .eq('user_id', user.id);
    } else {
      // Remove any empty ID to let Supabase generate one
      delete workoutData.id;
      return this.supabase.from('workouts').insert([workoutData]);
    }
  }

  async deleteWorkout(id: string): Promise<any> {
    const user = this.currentUserSubject.value;
    if (!user)
      return { data: null, error: new Error('User not authenticated') };

    return this.supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  }

  async getExercises(workoutId: string): Promise<any> {
    const user = this.currentUserSubject.value;
    if (!user)
      return { data: null, error: new Error('User not authenticated') };

    return this.supabase
      .from('exercises')
      .select('*')
      .eq('workout_id', workoutId)
      .eq('user_id', user.id);
  }

  async saveExercise(exercise: any): Promise<any> {
    const user = this.currentUserSubject.value;
    if (!user)
      return { data: null, error: new Error('User not authenticated') };

    // Clean up the exercise object to prevent database errors
    const exerciseData = { ...exercise };
    exerciseData.user_id = user.id;

    // Ensure sets is stored as JSONB if not already
    if (exerciseData.sets && typeof exerciseData.sets !== 'string') {
      // No need to convert as Supabase handles JSON objects properly
    }

    if (exerciseData.id) {
      return this.supabase
        .from('exercises')
        .update(exerciseData)
        .eq('id', exerciseData.id)
        .eq('user_id', user.id);
    } else {
      // Remove any empty ID to let Supabase generate one
      delete exerciseData.id;
      return this.supabase.from('exercises').insert([exerciseData]);
    }
  }

  async deleteExercise(id: string): Promise<any> {
    const user = this.currentUserSubject.value;
    if (!user)
      return { data: null, error: new Error('User not authenticated') };

    return this.supabase
      .from('exercises')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  }
}
