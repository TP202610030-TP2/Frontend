import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '@core/services/auth.service';
import type { LoginRequest } from '@core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <mat-card class="w-full max-w-md shadow-xl">
        <mat-card-content class="p-8">

          <div class="flex items-center justify-center gap-2 mb-6">
            <mat-icon class="text-green-700" style="font-size:36px;width:36px;height:36px">record_voice_over</mat-icon>
            <span class="text-xl font-bold text-green-700">ASR Quechua</span>
          </div>

          <h1 class="text-2xl font-semibold text-center text-gray-800 mb-1">Iniciar sesión</h1>
          <p class="text-center text-gray-500 text-sm mb-6">Bienvenido de vuelta</p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Correo electrónico</mat-label>
              <input matInput type="email" formControlName="email"
                     autocomplete="email" placeholder="tu@correo.com">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error>
                @if (form.get('email')?.hasError('required')) { El correo es requerido }
                @else { Ingresa un correo electrónico válido }
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'"
                     formControlName="password" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword = !showPassword"
                      [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error>
                @if (form.get('password')?.hasError('required')) { La contraseña es requerida }
                @else { Mínimo 8 caracteres }
              </mat-error>
            </mat-form-field>

            <div class="text-right -mt-2">
              <a routerLink="/auth/forgot-password"
                 class="text-sm text-green-700 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || loading"
                    class="h-12 text-base">
              @if (loading) {
                <mat-spinner diameter="20" class="mr-2" style="display:inline-block"></mat-spinner>
              }
              Iniciar sesión
            </button>

          </form>

          <p class="text-center text-sm text-gray-600 mt-6">
            ¿No tienes cuenta?&nbsp;
            <a routerLink="/auth/register" class="text-green-700 font-medium hover:underline">Registrarse</a>
          </p>

        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb       = inject(FormBuilder);
  private readonly authSvc  = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading      = false;
  showPassword = false;

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.authSvc.login(this.form.getRawValue() as LoginRequest).subscribe({
      next: () => { this.loading = false; },
      error: () => {
        this.loading = false;
        this.snackBar.open(
          'Correo o contraseña incorrectos. Verifica tus datos.',
          'Cerrar',
          { duration: 5000, verticalPosition: 'bottom', panelClass: ['snack-error'] },
        );
      },
    });
  }
}
