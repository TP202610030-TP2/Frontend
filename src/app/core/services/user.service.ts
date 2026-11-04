import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment as env } from '@env/environment';
import { API } from '@core/api/endpoints.registry';
import { UpdateProfileRequest, UserProfile } from '@core/models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  private readonly _profile = signal<UserProfile | null>(null);
  readonly profile = this._profile.asReadonly();

  /** GET /api/v1/users/profile — respuesta directa sin envelope */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${env.apiUrl}${API.users.profile.path}`).pipe(
      tap(p => this._profile.set(p)),
    );
  }

  /** PUT /api/v1/users/profile — respuesta directa sin envelope */
  updateProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${env.apiUrl}${API.users.updateProfile.path}`, data).pipe(
      tap(p => this._profile.set(p)),
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${env.apiUrl}${API.users.changePassword.path}`, {
      current_password: currentPassword,
      new_password:     newPassword,
    });
  }
}
