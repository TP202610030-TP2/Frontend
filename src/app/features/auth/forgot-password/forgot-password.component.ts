import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '@core/services/auth.service';

/** HU0004 — mensajes de resultado de la solicitud de recuperación. */
export const RECOVERY_MSG = {
  sent:     (email: string) =>
    `Te enviamos las instrucciones de recuperación a ${email}. Revisa tu bandeja de entrada y la carpeta de spam; el enlace caduca en 1 hora.`,
  notFound: 'No se encontró ningún usuario registrado con ese correo electrónico.',
  emailFailed:
    'No pudimos enviar el correo de recuperación en este momento. Inténtalo de nuevo en unos minutos.',
  generic:  'Ocurrió un error al procesar la solicitud. Inténtalo nuevamente.',
} as const;

@Component({
  selector: 'app-forgot-password',
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

          <h1 class="text-2xl font-semibold text-center text-gray-800 mb-1">Recuperar contraseña</h1>
          <p class="text-center text-gray-500 text-sm mb-6">
            Ingresa tu correo y te enviaremos instrucciones.
          </p>

          @if (submitted) {
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800 text-sm"
                 role="status" data-testid="recovery-success">
              {{ successMsg }}
            </div>
          } @else {
            @if (errorMsg) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center text-red-800 text-sm"
                   role="alert" data-testid="recovery-error">
                {{ errorMsg }}
              </div>
            }
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

              <button mat-raised-button color="primary" type="submit"
                      [disabled]="form.invalid || loading"
                      class="h-12 text-base">
                @if (loading) {
                  <mat-spinner diameter="20" class="mr-2" style="display:inline-block"></mat-spinner>
                }
                Enviar instrucciones
              </button>

            </form>
          }

          <p class="text-center text-sm text-gray-600 mt-6">
            <a routerLink="/auth/login" class="text-green-700 font-medium hover:underline">
              ← Volver al inicio de sesión
            </a>
          </p>

        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb      = inject(FormBuilder);
  private readonly authSvc = inject(AuthService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading    = false;
  submitted  = false;
  successMsg = '';
  errorMsg: string | null = null;

  submit(): void {
    if (this.form.invalid) return;
    const email = this.form.value.email!.trim();
    this.loading  = true;
    this.errorMsg = null;
    this.authSvc.requestRecovery(email).subscribe({
      next: () => {
        this.loading    = false;
        this.submitted  = true;
        this.successMsg = RECOVERY_MSG.sent(email);
      },
      error: (err: HttpErrorResponse) => {
        this.loading  = false;
        this.errorMsg = err?.status === 404 ? RECOVERY_MSG.notFound
                      : err?.status === 503 ? RECOVERY_MSG.emailFailed
                      : RECOVERY_MSG.generic;
      },
    });
  }
}
