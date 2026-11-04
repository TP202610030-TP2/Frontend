import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let router: { navigate: jest.Mock };

  beforeEach(() => {
    router = { navigate: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });
    http       = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    localStorage.setItem('asr_token', 'fake-jwt');
  });

  afterEach(() => {
    controller.verify();
    localStorage.clear();
  });

  it('401 limpia token y redirige a login — valida E1-HU05-S02', () => {
    http.get('/api/v1/users/profile').subscribe({ error: () => {} });
    controller.expectOne('/api/v1/users/profile')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('asr_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('413 retorna userMessage de límite de tamaño — valida E2-HU04-S02', done => {
    http.get('/api/v1/transcribe').subscribe({
      error: (err) => {
        expect(err.userMessage).toBe('El archivo supera el límite de 50 MB permitido.');
        done();
      },
    });
    controller.expectOne('/api/v1/transcribe')
      .flush({}, { status: 413, statusText: 'Payload Too Large' });
  });

  it('error de red status 0 retorna mensaje sin conexión — valida E4-HU06-S02', done => {
    http.get('/api/v1/status').subscribe({
      error: (err) => {
        expect(err.userMessage).toBe('Sin conexión al servidor.');
        done();
      },
    });
    controller.expectOne('/api/v1/status').error(new ProgressEvent('error'));
  });
});
