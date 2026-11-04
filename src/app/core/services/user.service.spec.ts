import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { UserProfile } from '@core/models/user.models';
import { API } from '@core/api/endpoints.registry';
import { environment as env } from '@env/environment';

const mockProfile: UserProfile = {
  user_id:       'u1',
  email:         'a@a.com',
  full_name:     'Ana',
  phone_number:  null,
  date_of_birth: null,
  created_at:    '2026-01-01T00:00:00Z',
};

describe('UserService', () => {
  let service: UserService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service    = TestBed.inject(UserService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('getProfile actualiza signal profile — E1-HU03-S01', () => {
    service.getProfile().subscribe();
    controller.expectOne(`${env.apiUrl}${API.users.profile.path}`).flush(mockProfile);
    expect(service.profile()).toEqual(mockProfile);
  });

  it('updateProfile actualiza signal y retorna perfil actualizado — E1-HU03-S02', () => {
    const updated = { ...mockProfile, full_name: 'Ana García' };
    service.updateProfile({ full_name: 'Ana García' }).subscribe(p => {
      expect(p.full_name).toBe('Ana García');
    });
    controller.expectOne(`${env.apiUrl}${API.users.updateProfile.path}`).flush(updated);
    expect(service.profile()?.full_name).toBe('Ana García');
  });

  it('updateProfile con error 422 propaga error — E1-HU03-S03', done => {
    service.updateProfile({ phone_number: 'invalid' }).subscribe({
      error: () => done(),
    });
    controller.expectOne(`${env.apiUrl}${API.users.updateProfile.path}`)
      .flush({ message: 'Validation error' }, { status: 422, statusText: 'Unprocessable Entity' });
  });
});
