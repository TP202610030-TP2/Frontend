import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';

import { authRoutes } from './auth.routes';

@Component({ standalone: true, template: '' })
class DummyComponent {}

/** Token con sesión vigente (el guard solo lee `exp`). */
const b64 = (o: object) => btoa(JSON.stringify(o));
const VALID_TOKEN = `${b64({ alg: 'HS256' })}.${b64({ user_id: 'u1', email: 'a@b.com', exp: 4102444800 })}.sig`;

describe('authRoutes con sesión iniciada', () => {
  let router: Router;

  beforeEach(() => {
    localStorage.setItem('asr_token', VALID_TOKEN);
    const routes = authRoutes.map(r =>
      r.loadComponent ? { ...r, loadComponent: undefined, component: DummyComponent } : r,
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'auth', children: routes },
          { path: 'app/dashboard', component: DummyComponent },
        ]),
      ],
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.removeItem('asr_token'));

  it('el enlace de recuperación abre /auth/reset-password aunque haya sesión', async () => {
    await router.navigateByUrl('/auth/reset-password?token=abc');
    expect(router.url).toBe('/auth/reset-password?token=abc');
  });

  it('login sigue redirigiendo al dashboard si hay sesión', async () => {
    await router.navigateByUrl('/auth/login');
    expect(router.url).toBe('/app/dashboard');
  });
});
