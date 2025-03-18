import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { Workout } from '../../models/workout.model';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    DialogModule,
    ConfirmDialogModule,
    ReactiveFormsModule,
    CalendarModule,
    InputTextModule,
    InputTextarea,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="app-container fade-in">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      <p-toolbar styleClass="mb-4 gap-2">
        <ng-template pTemplate="left">
          <h2 class="m-0">My Workouts</h2>
        </ng-template>
        <ng-template pTemplate="right">
          <div class="flex gap-2">
            <p-button
              label="New Workout"
              icon="pi pi-plus"
              (onClick)="openNewWorkout()"
              styleClass="p-button-sm"
            ></p-button>

            <p-button
              label="Profile"
              icon="pi pi-user"
              styleClass="p-button-outlined p-button-sm"
              (onClick)="navigateToProfile()"
            ></p-button>

            <p-button
              label="Logout"
              icon="pi pi-sign-out"
              styleClass="p-button-outlined p-button-danger p-button-sm"
              (onClick)="logout()"
            ></p-button>
          </div>
        </ng-template>
      </p-toolbar>

      <div
        *ngIf="workouts.length === 0 && !loading"
        class="text-center my-6 surface-card p-5 shadow-2 border-round"
      >
        <i class="pi pi-calendar text-5xl text-primary mb-3"></i>
        <h3>No Workouts Yet</h3>
        <p class="text-700 mb-4">
          Start tracking your fitness journey by adding your first workout.
        </p>
        <p-button
          label="Add Your First Workout"
          icon="pi pi-plus"
          (onClick)="openNewWorkout()"
        ></p-button>
      </div>

      <p-table
        *ngIf="workouts.length > 0 || loading"
        [value]="workouts"
        [rows]="10"
        [paginator]="true"
        [loading]="loading"
        [globalFilterFields]="['name', 'date', 'notes']"
        styleClass="p-datatable-gridlines p-datatable-responsive"
        [rowHover]="true"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-content-between align-items-center">
            <h5 class="m-0">Your Workout History</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                placeholder="Search..."
                (input)="applyFilterGlobal($event)"
              />
            </span>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name" class="font-bold">
              Workout <p-sortIcon field="name"></p-sortIcon>
            </th>
            <th pSortableColumn="date" class="font-bold">
              Date <p-sortIcon field="date"></p-sortIcon>
            </th>
            <th class="font-bold">Notes</th>
            <th class="font-bold">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-workout>
          <tr class="workout-item">
            <td>
              <span class="font-semibold">{{ workout.name }}</span>
            </td>
            <td>{{ workout.date | date : 'MMM d, y' }}</td>
            <td>
              <div *ngIf="workout.notes" class="line-clamp-2">
                {{ workout.notes }}
              </div>
              <span
                *ngIf="!workout.notes"
                class="text-color-secondary font-italic"
                >No notes</span
              >
            </td>
            <td>
              <div class="flex gap-2 justify-content-center">
                <button
                  pButton
                  pRipple
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-info p-button-sm"
                  (click)="viewWorkout(workout)"
                  pTooltip="View Details"
                ></button>
                <button
                  pButton
                  pRipple
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-success p-button-sm"
                  (click)="editWorkout(workout)"
                  pTooltip="Edit"
                ></button>
                <button
                  pButton
                  pRipple
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-sm"
                  (click)="confirmDelete(workout)"
                  pTooltip="Delete"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage" *ngIf="loading">
          <tr>
            <td colspan="4" class="text-center p-4">
              <div>
                <i
                  class="pi pi-spin pi-spinner text-primary"
                  style="font-size: 2rem"
                ></i>
                <p>Loading your workouts...</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Workout Dialog -->
      <p-dialog
        [(visible)]="workoutDialog"
        [style]="{ width: '450px' }"
        header="Workout Details"
        [modal]="true"
        styleClass="p-fluid"
      >
        <ng-template pTemplate="content">
          <form [formGroup]="workoutForm">
            <div class="field">
              <label for="name">Workout Name</label>
              <input
                type="text"
                pInputText
                id="name"
                formControlName="name"
                required
                autofocus
              />
              <small
                class="p-error"
                *ngIf="
                  workoutForm.get('name')?.invalid &&
                  workoutForm.get('name')?.touched
                "
              >
                Workout name is required.
              </small>
            </div>

            <div class="field">
              <label for="date">Date</label>
              <p-calendar
                formControlName="date"
                [showIcon]="true"
                [showButtonBar]="true"
              ></p-calendar>
              <small
                class="p-error"
                *ngIf="
                  workoutForm.get('date')?.invalid &&
                  workoutForm.get('date')?.touched
                "
              >
                Date is required.
              </small>
            </div>

            <div class="field">
              <label for="notes">Notes</label>
              <textarea
                pInputTextarea
                id="notes"
                formControlName="notes"
                rows="3"
              ></textarea>
            </div>
          </form>
        </ng-template>

        <ng-template pTemplate="footer">
          <button
            pButton
            pRipple
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            (click)="hideDialog()"
          ></button>
          <button
            pButton
            pRipple
            label="Save"
            icon="pi pi-check"
            class="p-button-text"
            (click)="saveWorkout()"
            [disabled]="workoutForm.invalid"
          ></button>
        </ng-template>
      </p-dialog>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  workouts: Workout[] = [];
  workout: Workout = {} as Workout;
  workoutDialog = false;
  loading = true;
  submitted = false;
  workoutForm: FormGroup;
  isEditMode = false;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.workoutForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      date: [new Date(), Validators.required],
      notes: [''],
    });
  }

  ngOnInit() {
    this.loadWorkouts();
  }

  async loadWorkouts() {
    this.loading = true;
    try {
      const { data, error } = await this.supabaseService.getWorkouts();
      if (error) throw error;

      this.workouts = data.map((workout: any) => ({
        ...workout,
        date: new Date(workout.date),
      }));
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load workouts: ' + error.message,
      });
    } finally {
      this.loading = false;
    }
  }

  openNewWorkout() {
    this.isEditMode = false;
    this.workoutForm.reset({
      date: new Date(),
    });
    this.submitted = false;
    this.workoutDialog = true;
  }

  editWorkout(workout: Workout) {
    this.isEditMode = true;
    this.workoutForm.patchValue({
      id: workout.id,
      name: workout.name,
      date: new Date(workout.date),
      notes: workout.notes,
    });
    this.workoutDialog = true;
  }

  viewWorkout(workout: Workout) {
    this.router.navigate(['/workout', workout.id]);
  }

  async saveWorkout() {
    this.submitted = true;

    if (this.workoutForm.invalid) return;

    try {
      const workoutData = { ...this.workoutForm.value };

      // When creating a new workout, remove the ID field completely
      if (!this.isEditMode || !workoutData.id) {
        delete workoutData.id;
      }

      const { data, error } = await this.supabaseService.saveWorkout(
        workoutData
      );
      if (error) throw error;

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Workout ${
          this.isEditMode ? 'updated' : 'created'
        } successfully`,
      });

      this.workoutDialog = false;
      this.loadWorkouts();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          `Failed to ${this.isEditMode ? 'update' : 'create'} workout: ` +
          error.message,
      });
    }
  }

  confirmDelete(workout: Workout) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this workout?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteWorkout(workout),
    });
  }

  async deleteWorkout(workout: Workout) {
    try {
      const { error } = await this.supabaseService.deleteWorkout(workout.id!);
      if (error) throw error;

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Workout deleted successfully',
      });

      this.loadWorkouts();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete workout: ' + error.message,
      });
    }
  }

  hideDialog() {
    this.workoutDialog = false;
    this.submitted = false;
  }

  async logout() {
    try {
      await this.authService.signOut();
      // Redirect is handled in the auth service
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to logout: ' + error.message,
      });
    }
  }

  applyFilterGlobal(event: any) {
    const table = event.target.parentNode.parentNode.parentNode.parentNode;
    table.filterGlobal(event.target.value, 'contains');
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}
