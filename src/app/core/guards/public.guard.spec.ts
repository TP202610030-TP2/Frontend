import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { publicGuard } from './public.guard';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

function makeJwt(expOffset: number): string {
  const payload = { user_id: 'u1', email: 'a@a.com', exp: Math.floor(Date.now() / 1000) + expOffset };
  return `header.${btoa(JSON.stringify(payload))}.sig`;
}

describe('publicGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: { createUrlTree: (c: string[]) => c } }] });
    localStorage.clear();
  });

  it('permite acceso sin token (usuario no autenticado)', () => {
    const result = TestBed.runInInjectionContext(() =>
      publicGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBe(true);
  });

  it('redirige a dashboard con token válido', () => {
    localStorage.setItem('asr_token', makeJwt(3600));
    const result = TestBed.runInInjectionContext(() =>
      publicGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toEqual(['/app/dashboard']);
  });
});
