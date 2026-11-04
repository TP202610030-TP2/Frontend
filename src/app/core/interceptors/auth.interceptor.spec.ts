import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http       = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    controller.verify();
    localStorage.clear();
  });

  it('adjunta Authorization header en request /api/ con token — valida E3-HU03-S01', () => {
    localStorage.setItem('asr_token', 'my-jwt');
    http.get('/api/v1/users/profile').subscribe();
    const req = controller.expectOne('/api/v1/users/profile');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt');
    req.flush({});
  });

  it('NO adjunta header si no hay token', () => {
    http.get('/api/v1/users/profile').subscribe();
    const req = controller.expectOne('/api/v1/users/profile');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('NO adjunta header a /api/docs aunque haya token', () => {
    localStorage.setItem('asr_token', 'my-jwt');
    http.get('http://localhost:8000/api/docs').subscribe();
    const req = controller.expectOne('http://localhost:8000/api/docs');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
