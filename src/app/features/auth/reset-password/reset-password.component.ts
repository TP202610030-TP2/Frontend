import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '@core/services/auth.service';
import { passwordMatchValidator } from '@shared/validators/password-match.validator';

const PASSWORD_PATTERN = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/;

@Component({
  selector: 'app-reset-password',
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

          <h1 class="text-2xl font-semibold text-center text-gray-800 mb-1">Nueva contraseña</h1>
          <p class="text-center text-gray-500 text-sm mb-6">Elige una contraseña segura.</p>

          @if (tokenError) {
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-800 text-sm"
                 role="alert">
              El enlace de recuperación expiró o ya fue utilizado.
              <a routerLink="/auth/forgot-password"
                 class="block mt-2 font-medium text-red-700 hover:underline">
                Solicitar uno nuevo
              </a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Nueva contraseña</mat-label>
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
                Guardar contraseña
              </button>

            </form>
          }

        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb       = inject(FormBuilder);
  private readonly authSvc  = inject(AuthService);
  private readonly route    = inject(ActivatedRoute);
  private readonly router   = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  form = this.fb.group(
    {
      password:        ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_PATTERN)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') },
  );

  loading      = false;
  showPassword = false;
  tokenError   = false;
  private token: string | null = null;

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  submit(): void {
    if (this.form.invalid || !this.token) return;
    this.loading = true;
    this.authSvc.resetPassword(this.token, this.form.value.password!).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Contraseña actualizada correctamente.', 'OK', { duration: 5000 });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400) {
          this.tokenError = true;
        } else {
          this.snackBar.open('Error al restablecer la contraseña. Inténtalo de nuevo.', 'Cerrar', { duration: 5000 });
        }
      },
    });
  }
}
