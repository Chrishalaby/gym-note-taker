export interface Workout {
  id?: string;
  name: string;
  date: Date;
  notes?: string;
  user_id?: string;
  created_at?: Date;
}

export interface Exercise {
  id?: string;
  workout_id: string;
  name: string;
  sets: Set[];
  notes?: string;
  user_id?: string;
  created_at?: Date;
}

export interface Set {
  reps: number;
  weight: number;
  unit: 'kg' | 'lbs';
}
