import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '@core/services/auth.service';
import type { RegisterRequest } from '@core/models/auth.models';
import { passwordMatchValidator } from '@shared/validators/password-match.validator';

const PASSWORD_PATTERN = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/;

@Component({
  selector: 'app-register',
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

          <h1 class="text-2xl font-semibold text-center text-gray-800 mb-1">Crear cuenta</h1>
          <p class="text-center text-gray-500 text-sm mb-6">Regístrate para comenzar</p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="fullName" autocomplete="name" placeholder="Ana García">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error>
                @if (form.get('fullName')?.hasError('required')) { El nombre es requerido }
                @else { Mínimo 2 caracteres }
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Correo electrónico</mat-label>
              <input matInput type="email" formControlName="email"
                     autocomplete="email" placeholder="tu@correo.com">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error>
                @if (form.get('email')?.hasError('required')) { El correo es requerido }
                @else if (form.get('email')?.hasError('emailExists')) {
                  Este correo ya está registrado en la plataforma
                }
                @else { Ingresa un correo electrónico válido }
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'"
                     formControlName="password" autocomplete="new-password">
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword = !showPassword"
                      [attr.aria-label]="showPassword ? 'Ocultar' : 'Mostrar'">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-hint>Mínimo 8 caracteres, mayúscula, minúscula y número</mat-hint>
              <mat-error>
                @if (form.get('password')?.hasError('required')) { La contraseña es requerida }
                @else if (form.get('password')?.hasError('minlength')) { Mínimo 8 caracteres }
                @else { Debe incluir mayúscula, minúscula y número }
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Confirmar contraseña</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'"
                     formControlName="confirmPassword" autocomplete="new-password">
              <mat-error>
                @if (form.get('confirmPassword')?.hasError('required')) { Confirma tu contraseña }
                @else { Las contraseñas no coinciden }
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || loading"
                    class="h-12 text-base">
              @if (loading) {
                <mat-spinner diameter="20" class="mr-2" style="display:inline-block"></mat-spinner>
              }
              Crear cuenta
            </button>

          </form>

          <p class="text-center text-sm text-gray-600 mt-6">
            ¿Ya tienes cuenta?&nbsp;
            <a routerLink="/auth/login" class="text-green-700 font-medium hover:underline">Iniciar sesión</a>
          </p>

        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb       = inject(FormBuilder);
  private readonly authSvc  = inject(AuthService);
  private readonly router   = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  form = this.fb.group(
    {
      fullName:        ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_PATTERN)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') },
  );

  loading      = false;
  showPassword = false;

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { fullName, email, password } = this.form.getRawValue();
    const payload: RegisterRequest = { full_name: fullName!, email: email!, password: password! };

    this.authSvc.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Cuenta creada exitosamente. Ahora puedes iniciar sesión.', 'OK', { duration: 5000 });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400 || err.status === 409) {
          this.form.get('email')?.setErrors({ emailExists: true });
        } else {
          this.snackBar.open('Error al crear la cuenta. Inténtalo de nuevo.', 'Cerrar', { duration: 5000 });
        }
      },
    });
  }
}
