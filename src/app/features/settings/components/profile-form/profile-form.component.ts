import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserService } from '@core/services/user.service';
import type { UpdateProfileRequest } from '@core/models/user.models';

const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

function maxAgeDate(minYears: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minYears);
  return d;
}

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <!-- Skeleton loader -->
    @if (loading()) {
      <div class="animate-pulse flex flex-col gap-4">
        <div class="h-14 bg-gray-200 rounded-lg"></div>
        <div class="h-14 bg-gray-200 rounded-lg"></div>
        <div class="h-14 bg-gray-200 rounded-lg"></div>
        <div class="h-14 bg-gray-200 rounded-lg"></div>
      </div>
    }

    @if (!loading()) {
      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4" novalidate>

        <!-- Nombre completo -->
        <mat-form-field appearance="outline">
          <mat-label>Nombre completo</mat-label>
          <input matInput formControlName="fullName" autocomplete="name" />
          @if (form.get('fullName')?.hasError('required') && form.get('fullName')?.touched) {
            <mat-error>El nombre es obligatorio.</mat-error>
          }
        </mat-form-field>

        <!-- Email (solo lectura) -->
        <mat-form-field appearance="outline">
          <mat-label>Correo electrónico</mat-label>
          <input matInput formControlName="email" autocomplete="off" />
          <mat-hint>El correo no puede modificarse.</mat-hint>
        </mat-form-field>

        <!-- Teléfono -->
        <mat-form-field appearance="outline">
          <mat-label>Teléfono (E.164)</mat-label>
          <input matInput formControlName="phone" placeholder="+51987654321" autocomplete="tel" />
          @if (form.get('phone')?.hasError('pattern') && form.get('phone')?.touched) {
            <mat-error>Formato inválido. Ejemplo: +51987654321</mat-error>
          }
        </mat-form-field>

        <!-- Fecha de nacimiento -->
        <mat-form-field appearance="outline">
          <mat-label>Fecha de nacimiento</mat-label>
          <input matInput [matDatepicker]="dob" formControlName="dateOfBirth" />
          <mat-datepicker-toggle matIconSuffix [for]="dob" />
          <mat-datepicker #dob [startAt]="maxDob" />
          @if (form.get('dateOfBirth')?.hasError('matDatepickerMax') && form.get('dateOfBirth')?.touched) {
            <mat-error>Debes tener al menos 13 años.</mat-error>
          }
        </mat-form-field>

        <!-- Botón submit -->
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="form.invalid || saving()">
          @if (saving()) {
            <mat-spinner diameter="20" class="inline-block" />
          } @else {
            Guardar cambios
          }
        </button>

      </form>
    }
  `,
})
export class ProfileFormComponent implements OnInit {
  private readonly userSvc  = inject(UserService);
  private readonly fb       = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly saving  = signal(false);

  readonly maxDob = maxAgeDate(13);

  readonly form = this.fb.group({
    fullName:    ['', Validators.required],
    email:       [{ value: '', disabled: true }],
    phone:       ['', Validators.pattern(PHONE_PATTERN)],
    dateOfBirth: [null as Date | null],
  });

  ngOnInit(): void {
    this.userSvc.getProfile().subscribe({
      next: profile => {
        this.form.patchValue({
          fullName:    profile.full_name,
          email:       profile.email,
          phone:       profile.phone_number ?? '',
          dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : null,
        });
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('No se pudo cargar el perfil.', 'Cerrar', { duration: 5000 });
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);

    const raw = this.form.getRawValue();
    const body: UpdateProfileRequest = {
      full_name:     raw.fullName ?? undefined,
      phone_number:  raw.phone    || undefined,
      date_of_birth: raw.dateOfBirth
        ? (raw.dateOfBirth as Date).toISOString().split('T')[0]
        : undefined,
    };

    this.userSvc.updateProfile(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open('Perfil actualizado correctamente', 'OK', { duration: 3000 });
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'No se pudo actualizar el perfil.';
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
      },
    });
  }
}
