import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { Workout } from '../../models/workout.model';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DatePickerModule,
    TabViewModule,
    ChartModule,
    AvatarModule,
    ToastModule,
    DividerModule,
  ],
  providers: [MessageService],
  template: `
    <div class="app-container fade-in">
      <p-toast></p-toast>

      <div class="flex flex-column md:flex-row gap-3">
        <!-- User Profile Card -->
        <div class="md:w-4 lg:w-3">
          <p-card styleClass="h-full">
            <div class="flex flex-column align-items-center text-center">
              <p-avatar
                [label]="getUserInitials()"
                styleClass="mr-2 mb-2"
                size="xlarge"
                [style]="{ 'background-color': '#4f46e5', color: '#ffffff' }"
              ></p-avatar>

              <h2 class="mt-2 mb-1">{{ userEmail }}</h2>
              <p class="text-color-secondary m-0">Fitness Enthusiast</p>

              <p-divider></p-divider>

              <div class="flex justify-content-between w-full px-2">
                <div class="text-center">
                  <h3>{{ totalWorkouts }}</h3>
                  <p class="text-sm text-color-secondary">Workouts</p>
                </div>
                <div class="text-center">
                  <h3>{{ totalExercises }}</h3>
                  <p class="text-sm text-color-secondary">Exercises</p>
                </div>
                <div class="text-center">
                  <h3>{{ streak }}</h3>
                  <p class="text-sm text-color-secondary">Streak</p>
                </div>
              </div>

              <p-divider></p-divider>

              <p-button
                label="Go to Dashboard"
                icon="pi pi-arrow-left"
                styleClass="p-button-outlined mt-3"
                (onClick)="navigateToDashboard()"
              ></p-button>
            </div>
          </p-card>
        </div>

        <!-- Tabs Area -->
        <div class="md:w-8 lg:w-9">
          <p-tabView>
            <!-- Calendar Tab -->
            <p-tabPanel header="Workout Calendar">
              <p-card>
                <p-datepicker
                  [(ngModel)]="date"
                  [inline]="true"
                  [showWeek]="true"
                  [readonlyInput]="true"
                  [showOtherMonths]="false"
                />
                <!--
                  [dateTemplate]="dateTemplate"
                 -->

                <ng-template #dateTemplate let-date>
                  <span
                    [class.has-workout]="hasWorkoutOnDate(date)"
                    class="calendar-day p-1"
                  >
                    {{ date.day }}
                  </span>
                </ng-template>

                <div class="mt-3">
                  <h3 *ngIf="selectedDateWorkouts.length > 0">
                    Workouts on {{ selectedDate | date : 'mediumDate' }}
                  </h3>
                  <p *ngIf="selectedDateWorkouts.length === 0">
                    No workouts on {{ selectedDate | date : 'mediumDate' }}
                  </p>

                  <div
                    *ngFor="let workout of selectedDateWorkouts"
                    class="mb-2 workout-card p-3 border-round surface-card"
                  >
                    <div
                      class="flex justify-content-between align-items-center"
                    >
                      <h4 class="m-0">{{ workout.name }}</h4>
                      <p-button
                        icon="pi pi-external-link"
                        styleClass="p-button-rounded p-button-text"
                        (onClick)="viewWorkout(workout)"
                      ></p-button>
                    </div>
                    <p class="text-color-secondary" *ngIf="workout.notes">
                      {{ workout.notes }}
                    </p>
                  </div>
                </div>
              </p-card>
            </p-tabPanel>

            <!-- Stats Tab -->
            <p-tabPanel header="Workout Stats">
              <p-card>
                <div class="flex flex-column md:flex-row gap-3">
                  <div class="md:w-6">
                    <h3>Workout Frequency</h3>
                    <p-chart
                      type="bar"
                      [data]="workoutChartData"
                      [options]="chartOptions"
                    ></p-chart>
                  </div>
                  <div class="md:w-6">
                    <h3>Recent Progress</h3>
                    <div *ngIf="progressData.length === 0" class="mt-2">
                      <p>No workout data available to show progress.</p>
                    </div>
                    <div *ngFor="let item of progressData" class="mb-3">
                      <div class="flex justify-content-between mb-1">
                        <span>{{ item.exercise }}</span>
                        <span class="font-bold">
                          {{ item.progress > 0 ? '+' : '' }}{{ item.progress }}%
                        </span>
                      </div>
                      <div
                        class="progress-bar border-round overflow-hidden"
                        style="height: 8px; background-color: var(--surface-200);"
                      >
                        <div
                          class="border-round"
                          [style.width.%]="100"
                          [style.background-color]="
                            item.progress > 0
                              ? 'var(--green-500)'
                              : 'var(--red-500)'
                          "
                          style="height: 100%;"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </p-card>
            </p-tabPanel>
          </p-tabView>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  date: Date = new Date();
  selectedDate: Date = new Date();
  workouts: Workout[] = [];
  selectedDateWorkouts: Workout[] = [];
  totalWorkouts: number = 0;
  totalExercises: number = 0;
  streak: number = 0;
  userEmail: string = '';

  workoutChartData: any;
  chartOptions: any;

  progressData: any[] = [
    { exercise: 'Bench Press', progress: 12 },
    { exercise: 'Squats', progress: 8 },
    { exercise: 'Deadlift', progress: 5 },
    { exercise: 'Pull-ups', progress: -2 },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private messageService: MessageService
  ) {
    this.initChartData();
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadWorkouts();
  }

  loadUserInfo(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.userEmail = user.email || 'Gym Enthusiast';
      }
    });
  }

  async loadWorkouts() {
    try {
      const { data, error } = await this.supabaseService.getWorkouts();
      if (error) throw error;

      this.workouts = data.map((workout: any) => ({
        ...workout,
        date: new Date(workout.date),
      }));

      this.totalWorkouts = this.workouts.length;
      this.calculateStreak();
      this.updateSelectedDateWorkouts();
      this.loadExercisesCount();
      this.updateChartData();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load workouts: ' + error.message,
      });
    }
  }

  async loadExercisesCount(): Promise<void> {
    let count = 0;
    try {
      for (const workout of this.workouts) {
        const { data, error } = await this.supabaseService.getExercises(
          workout.id!
        );
        if (error) throw error;

        if (data) {
          count += data.length;
        }
      }

      this.totalExercises = count;
    } catch (error: any) {
      console.error('Error loading exercise count:', error);
    }
  }

  getUserInitials(): string {
    if (!this.userEmail) return 'U';
    return this.userEmail.charAt(0).toUpperCase();
  }

  hasWorkoutOnDate(dateInfo: any): boolean {
    const date = new Date(dateInfo.year, dateInfo.month, dateInfo.day);
    return this.workouts.some((workout) => {
      const workoutDate = new Date(workout.date);
      return (
        workoutDate.getDate() === date.getDate() &&
        workoutDate.getMonth() === date.getMonth() &&
        workoutDate.getFullYear() === date.getFullYear()
      );
    });
  }

  updateSelectedDateWorkouts(): void {
    this.selectedDate = this.date;
    this.selectedDateWorkouts = this.workouts.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return (
        workoutDate.getDate() === this.selectedDate.getDate() &&
        workoutDate.getMonth() === this.selectedDate.getMonth() &&
        workoutDate.getFullYear() === this.selectedDate.getFullYear()
      );
    });
  }

  calculateStreak(): void {
    if (this.workouts.length === 0) {
      this.streak = 0;
      return;
    }

    // Sort workouts by date (newest first)
    const sortedWorkouts = [...this.workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let currentDate = new Date(today);

    // Check if there's a workout today
    const hasWorkoutToday = sortedWorkouts.some((workout) => {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === today.getTime();
    });

    if (hasWorkoutToday) {
      currentStreak = 1;
    }

    // Go back one day at a time and check for workouts
    for (let i = 1; i <= 60; i++) {
      // Check up to 60 days back
      currentDate.setDate(currentDate.getDate() - 1);

      const hasWorkout = sortedWorkouts.some((workout) => {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === currentDate.getTime();
      });

      if (hasWorkout) {
        if (currentStreak > 0) {
          // Only increment if already started
          currentStreak++;
        } else if (i === 1) {
          // Or if it's yesterday (start the streak)
          currentStreak = 1;
        }
      } else if (currentStreak > 0) {
        // Break the streak
        break;
      }
    }

    this.streak = currentStreak;
  }

  initChartData(): void {
    this.workoutChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Workouts',
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: '#4f46e5',
        },
      ],
    };

    this.chartOptions = {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    };
  }

  updateChartData(): void {
    // Count workouts by day of the week
    const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

    this.workouts.forEach((workout) => {
      const workoutDate = new Date(workout.date);
      const dayOfWeek = workoutDate.getDay(); // 0 = Sunday, 6 = Saturday
      dayCount[dayOfWeek]++;
    });

    // Rearrange to Mon-Sun
    const monToSun = [...dayCount.slice(1), dayCount[0]];

    this.workoutChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Workouts',
          data: monToSun,
          backgroundColor: '#4f46e5',
        },
      ],
    };
  }

  viewWorkout(workout: Workout): void {
    this.router.navigate(['/workout', workout.id]);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
