import { HttpInterceptorFn } from '@angular/common/http';

/** Rutas públicas que NO deben llevar el Bearer token */
const PUBLIC_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/password-recovery',
  '/api/v1/auth/password-reset',
  '/api/docs',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('asr_token');

  if (!token) return next(req);

  // Endpoints públicos: nunca enviar el Bearer (evita 401 con token expirado)
  if (PUBLIC_PATHS.some(p => req.url.includes(p))) return next(req);

  if (req.url.includes('/api/') || req.url.includes('/ws/')) {
    return next(req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    }));
  }

  return next(req);
};
