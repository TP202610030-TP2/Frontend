import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token  = localStorage.getItem('asr_token');

  if (!token) {
    return true;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('asr_token');
      return true;
    }
    return router.createUrlTree(['/app/dashboard']);
  } catch {
    localStorage.removeItem('asr_token');
    return true;
  }
};
