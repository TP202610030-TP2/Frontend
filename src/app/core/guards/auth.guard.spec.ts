import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

function makeJwt(expOffset: number): string {
  const payload = { user_id: 'u1', email: 'a@a.com', exp: Math.floor(Date.now() / 1000) + expOffset };
  return `header.${btoa(JSON.stringify(payload))}.sig`;
}

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: { createUrlTree: (c: string[]) => c } }] });
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  it('permite acceso con token válido', () => {
    localStorage.setItem('asr_token', makeJwt(3600));
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBe(true);
  });

  it('redirige a login sin token', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toEqual(['/auth/login']);
  });

  it('redirige a login con token expirado y limpia storage', () => {
    localStorage.setItem('asr_token', makeJwt(-1));
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toEqual(['/auth/login']);
    expect(localStorage.getItem('asr_token')).toBeNull();
  });
});
