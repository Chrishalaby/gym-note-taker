import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { Exercise, Workout } from '../../models/workout.model';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="app-container fade-in">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      <p-toolbar styleClass="mb-4 gap-2">
        <ng-template pTemplate="left">
          <button
            pButton
            pRipple
            icon="pi pi-arrow-left"
            label="Back"
            class="p-button-outlined p-button-sm mr-2"
            (click)="goBack()"
          ></button>
          <h2 *ngIf="workout" class="m-0">
            {{ workout.name }}
            <span class="text-sm font-normal text-color-secondary">{{
              workout.date | date : 'MMM d, y'
            }}</span>
          </h2>
        </ng-template>
        <ng-template pTemplate="right">
          <p-button
            label="Add Exercise"
            icon="pi pi-plus"
            styleClass="p-button-sm"
            (onClick)="openNewExercise()"
          ></p-button>
        </ng-template>
      </p-toolbar>

      <p-card *ngIf="workout?.notes" styleClass="mb-4 workout-notes">
        <ng-template pTemplate="header">
          <div class="flex align-items-center gap-2 px-3 py-2">
            <i class="pi pi-info-circle text-primary"></i>
            <h3 class="m-0 text-lg">Workout Notes</h3>
          </div>
        </ng-template>
        <p>{{ workout?.notes }}</p>
      </p-card>

      <div
        *ngIf="exercises.length === 0 && !loading"
        class="text-center my-6 surface-card p-5 shadow-2 border-round"
      >
        <i class="pi pi-dumbbell text-5xl text-primary mb-3"></i>
        <h3>No Exercises Yet</h3>
        <p class="text-700 mb-4">
          Add exercises to track your progress in this workout.
        </p>
        <p-button
          label="Add Your First Exercise"
          icon="pi pi-plus"
          (onClick)="openNewExercise()"
        ></p-button>
      </div>

      <div *ngIf="exercises.length > 0" class="exercise-list grid">
        <div
          *ngFor="let exercise of exercises"
          class="col-12 md:col-6 lg:col-4 mb-3"
        >
          <p-card styleClass="workout-card h-full">
            <ng-template pTemplate="header">
              <div
                class="flex justify-content-between align-items-center px-3 py-2 bg-primary"
              >
                <h3 class="m-0 text-white">{{ exercise.name }}</h3>
                <div>
                  <button
                    pButton
                    pRipple
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-sm p-button-text p-button-plain"
                    (click)="editExercise(exercise)"
                    pTooltip="Edit Exercise"
                  ></button>
                  <button
                    pButton
                    pRipple
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-sm p-button-text p-button-plain"
                    (click)="confirmDelete(exercise)"
                    pTooltip="Delete Exercise"
                  ></button>
                </div>
              </div>
            </ng-template>

            <div>
              <h4 class="mb-2">Sets</h4>
              <ul class="list-none p-0 m-0">
                <li
                  *ngFor="let set of exercise.sets; let i = index"
                  class="mb-2 p-2 surface-ground border-round flex align-items-center"
                >
                  <span class="text-sm font-bold mr-2">{{ i + 1 }}.</span>
                  <div class="flex-1">
                    <span class="font-semibold">{{ set.reps }} reps</span> ×
                    <span class="font-semibold"
                      >{{ set.weight }} {{ set.unit }}</span
                    >
                  </div>
                </li>
              </ul>

              <div *ngIf="exercise.notes" class="mt-3">
                <h4 class="mb-2">Notes</h4>
                <p class="m-0 text-color-secondary">{{ exercise.notes }}</p>
              </div>
            </div>
          </p-card>
        </div>
      </div>

      <div *ngIf="loading" class="text-center p-4">
        <i
          class="pi pi-spin pi-spinner text-primary"
          style="font-size: 2rem"
        ></i>
        <p>Loading exercises...</p>
      </div>

      <!-- Exercise Dialog -->
      <p-dialog
        [(visible)]="exerciseDialog"
        [style]="{ width: '500px' }"
        header="Exercise Details"
        [modal]="true"
        styleClass="p-fluid"
      >
        <ng-template pTemplate="content">
          <form [formGroup]="exerciseForm">
            <div class="field">
              <label for="name">Exercise Name</label>
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
                  exerciseForm.get('name')?.invalid &&
                  exerciseForm.get('name')?.touched
                "
              >
                Exercise name is required.
              </small>
            </div>

            <div class="field">
              <label>Sets</label>
              <div formArrayName="sets">
                <div
                  *ngFor="let set of setsArray.controls; let i = index"
                  [formGroupName]="i"
                  class="flex mb-2 gap-2 align-items-center"
                >
                  <p-inputNumber
                    formControlName="reps"
                    placeholder="Reps"
                    [min]="1"
                    [showButtons]="true"
                    [style]="{ width: '33%' }"
                  ></p-inputNumber>
                  <p-inputNumber
                    formControlName="weight"
                    placeholder="Weight"
                    [min]="0"
                    [showButtons]="true"
                    [style]="{ width: '33%' }"
                  ></p-inputNumber>
                  <p-dropdown
                    formControlName="unit"
                    [options]="weightUnits"
                    optionLabel="label"
                    optionValue="value"
                    [style]="{ width: '25%' }"
                  ></p-dropdown>

                  <button
                    pButton
                    pRipple
                    type="button"
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-danger"
                    (click)="removeSet(i)"
                    *ngIf="setsArray.controls.length > 1"
                  ></button>
                </div>

                <button
                  pButton
                  pRipple
                  type="button"
                  label="Add Set"
                  icon="pi pi-plus"
                  class="p-button-outlined p-button-sm mt-2"
                  (click)="addSet()"
                ></button>
              </div>
            </div>

            <div class="field">
              <label for="notes">Notes</label>
              <textarea
                id="notes"
                pInputText
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
            (click)="saveExercise()"
            [disabled]="exerciseForm.invalid"
          ></button>
        </ng-template>
      </p-dialog>
    </div>
  `,
})
export class WorkoutDetailComponent implements OnInit {
  workoutId!: string;
  workout: Workout | null = null;
  exercises: Exercise[] = [];
  exercise: Exercise = {} as Exercise;
  exerciseDialog = false;
  loading = true;
  exerciseForm!: FormGroup;
  isEditMode = false;

  weightUnits = [
    { label: 'kg', value: 'kg' },
    { label: 'lbs', value: 'lbs' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.workoutId = params['id'];
      this.loadWorkoutDetails();
      this.loadExercises();
    });
  }

  initForm() {
    this.exerciseForm = this.fb.group({
      id: [''],
      workout_id: [''],
      name: ['', Validators.required],
      sets: this.fb.array([this.createSetGroup()]),
      notes: [''],
    });
  }

  createSetGroup(): FormGroup {
    return this.fb.group({
      reps: [8, [Validators.required, Validators.min(1)]],
      weight: [10, [Validators.required, Validators.min(0)]],
      unit: ['kg', Validators.required],
    });
  }

  get setsArray() {
    return this.exerciseForm.get('sets') as FormArray;
  }

  addSet() {
    this.setsArray.push(this.createSetGroup());
  }

  removeSet(index: number) {
    if (this.setsArray.length > 1) {
      this.setsArray.removeAt(index);
    }
  }

  async loadWorkoutDetails() {
    try {
      const { data, error } = await this.supabaseService.getWorkouts();
      if (error) throw error;

      const workout = data.find((w: any) => w.id === this.workoutId);
      if (workout) {
        this.workout = {
          ...workout,
          date: new Date(workout.date),
        };
      }
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load workout details: ' + error.message,
      });
    }
  }

  async loadExercises() {
    this.loading = true;
    try {
      const { data, error } = await this.supabaseService.getExercises(
        this.workoutId
      );
      if (error) throw error;

      this.exercises = data;
      // Parse sets from JSON if stored as string
      this.exercises.forEach((exercise) => {
        if (typeof exercise.sets === 'string') {
          exercise.sets = JSON.parse(exercise.sets);
        }
      });
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load exercises: ' + error.message,
      });
    } finally {
      this.loading = false;
    }
  }

  openNewExercise() {
    this.isEditMode = false;
    this.initForm();
    this.exerciseForm.patchValue({
      workout_id: this.workoutId,
    });
    this.exerciseDialog = true;
  }

  editExercise(exercise: Exercise) {
    this.isEditMode = true;
    this.initForm();

    // Remove all sets first and add the ones from the exercise
    while (this.setsArray.length) {
      this.setsArray.removeAt(0);
    }

    // Add sets from the exercise
    exercise.sets.forEach((set) => {
      this.setsArray.push(
        this.fb.group({
          reps: [set.reps, [Validators.required, Validators.min(1)]],
          weight: [set.weight, [Validators.required, Validators.min(0)]],
          unit: [set.unit, Validators.required],
        })
      );
    });

    this.exerciseForm.patchValue({
      id: exercise.id,
      workout_id: exercise.workout_id,
      name: exercise.name,
      notes: exercise.notes,
    });

    this.exerciseDialog = true;
  }

  async saveExercise() {
    if (this.exerciseForm.invalid) return;

    try {
      const exerciseData = { ...this.exerciseForm.value };

      // When creating a new exercise, remove the ID field completely
      if (!this.isEditMode || !exerciseData.id) {
        delete exerciseData.id;
      }

      const { data, error } = await this.supabaseService.saveExercise(
        exerciseData
      );
      if (error) throw error;

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Exercise ${
          this.isEditMode ? 'updated' : 'created'
        } successfully`,
      });

      this.exerciseDialog = false;
      this.loadExercises();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          `Failed to ${this.isEditMode ? 'update' : 'create'} exercise: ` +
          error.message,
      });
    }
  }

  confirmDelete(exercise: Exercise) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this exercise?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteExercise(exercise),
    });
  }

  async deleteExercise(exercise: Exercise) {
    try {
      const { error } = await this.supabaseService.deleteExercise(exercise.id!);
      if (error) throw error;

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Exercise deleted successfully',
      });

      this.loadExercises();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete exercise: ' + error.message,
      });
    }
  }

  hideDialog() {
    this.exerciseDialog = false;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
