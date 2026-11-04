import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token  = localStorage.getItem('asr_token');

  if (!token) {
    return router.createUrlTree(['/auth/login']);
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('asr_token');
      return router.createUrlTree(['/auth/login']);
    }
    return true;
  } catch {
    localStorage.removeItem('asr_token');
    return router.createUrlTree(['/auth/login']);
  }
};
