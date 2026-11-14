import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';

import { environment as env } from '@env/environment';
import { API } from '@core/api/endpoints.registry';
import {
  JwtPayload,
  LoginRequest,
  LoginResponse,
  PasswordRecoveryRequest,
  PasswordResetRequest,
  RegisterRequest,
  RegisterResponse,
} from '@core/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<LoginResponse['user'] | null>(null);
  readonly currentUser     = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor() {
    const payload = this.getTokenPayload();
    if (payload && !this.isTokenExpired()) {
      this._currentUser.set({ user_id: payload.user_id, email: payload.email, full_name: '' });
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${env.apiUrl}${API.auth.login.path}`, request).pipe(
      tap(res => {
        localStorage.setItem('asr_token', res.token);
        this._currentUser.set(res.user);
        this.router.navigate(['/app/dashboard']);
      }),
    );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${env.apiUrl}${API.auth.register.path}`, request);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${env.apiUrl}${API.auth.logout.path}`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(void 0);
      }),
    );
  }

  requestRecovery(email: string): Observable<void> {
    const body: PasswordRecoveryRequest = { email };
    return this.http.post<void>(`${env.apiUrl}${API.auth.recovery.path}`, body);
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    const body: PasswordResetRequest = { token, new_password: newPassword };
    return this.http.post<void>(`${env.apiUrl}${API.auth.reset.path}`, body);
  }

  getToken(): string | null {
    return localStorage.getItem('asr_token');
  }

  getTokenPayload(): JwtPayload | null {
    try {
      const token = this.getToken();
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const payload = this.getTokenPayload();
    if (!payload) return true;
    return payload.exp * 1000 < Date.now();
  }

  /** Descarta la sesión local sin llamar al backend ni navegar (p. ej. tras restablecer la contraseña). */
  discardLocalSession(): void {
    localStorage.removeItem('asr_token');
    this._currentUser.set(null);
  }

  private clearSession(): void {
    localStorage.removeItem('asr_token');
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
