import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let userMessage: string;

      switch (error.status) {
        case 0:
          userMessage = 'Sin conexión al servidor.';
          break;
        case 401:
          localStorage.removeItem('asr_token');
          router.navigate(['/auth/login']);
          userMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          break;
        case 413:
          userMessage = 'El archivo supera el límite de 50 MB permitido.';
          break;
        case 429:
          userMessage = 'Demasiados intentos. Espera 15 minutos.';
          break;
        default:
          userMessage = (error.error as { message?: string })?.message
            ?? 'Ha ocurrido un error inesperado.';
      }

      return throwError(() => Object.assign(error, { userMessage }));
    }),
  );
};
