import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { LoginResponse } from '@core/models/auth.models';
import { API } from '@core/api/endpoints.registry';
import { environment as env } from '@env/environment';

function makeToken(expOffset: number): string {
  const payload = { user_id: 'u1', email: 'a@a.com', exp: Math.floor(Date.now() / 1000) + expOffset };
  return `header.${btoa(JSON.stringify(payload))}.sig`;
}

describe('AuthService', () => {
  let service: AuthService;
  let controller: HttpTestingController;
  let router: { navigate: jest.Mock };

  beforeEach(() => {
    router = { navigate: jest.fn() };
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });
    service    = TestBed.inject(AuthService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { controller.verify(); localStorage.clear(); });

  it('login exitoso guarda token y actualiza signal — E1-HU02-S01', () => {
    const mockRes: LoginResponse = {
      token: makeToken(86400),
      expires_in: 86400,
      user: { user_id: 'u1', email: 'a@a.com', full_name: 'Ana' },
    };
    service.login({ email: 'a@a.com', password: 'Abc12345' }).subscribe();

    controller.expectOne(`${env.apiUrl}${API.auth.login.path}`).flush(mockRes);

    expect(localStorage.getItem('asr_token')).toBe(mockRes.token);
    expect(service.currentUser()?.email).toBe('a@a.com');
    expect(router.navigate).toHaveBeenCalledWith(['/app/dashboard']);
  });

  it('login con 401 propaga error al componente — E1-HU02-S02', done => {
    service.login({ email: 'x@x.com', password: 'wrong' }).subscribe({
      error: () => done(),
    });
    controller.expectOne(`${env.apiUrl}${API.auth.login.path}`)
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('logout elimina token y navega a login — E1-HU05-S01', () => {
    localStorage.setItem('asr_token', makeToken(3600));
    service.logout().subscribe();

    controller.expectOne(`${env.apiUrl}${API.auth.logout.path}`)
      .flush(null, { status: 204, statusText: 'No Content' });

    expect(localStorage.getItem('asr_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('logout limpia token aunque el backend falle — E1-HU05-S01', () => {
    localStorage.setItem('asr_token', makeToken(3600));
    service.logout().subscribe();

    controller.expectOne(`${env.apiUrl}${API.auth.logout.path}`)
      .flush({}, { status: 500, statusText: 'Server Error' });

    expect(localStorage.getItem('asr_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('isTokenExpired retorna true con token vencido — E1-HU05-S02', () => {
    localStorage.setItem('asr_token', makeToken(-1));
    expect(service.isTokenExpired()).toBe(true);
  });

  it('register llama al endpoint correcto — E1-HU01-S01', () => {
    service.register({ full_name: 'Ana', email: 'a@a.com', password: 'Abc12345' }).subscribe();
    const req = controller.expectOne(`${env.apiUrl}${API.auth.register.path}`);
    expect(req.request.method).toBe('POST');
    req.flush({ user_id: 'u1', email: 'a@a.com', full_name: 'Ana', created_at: '' });
  });
});
