import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SettingsComponent } from './settings.component';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import type { UserProfile } from '@core/models/user.models';

const mockProfile: UserProfile = {
  user_id:       'u-1',
  email:         'test@example.com',
  full_name:     'Ana Torres',
  phone_number:  null,
  date_of_birth: null,
  created_at:    '2024-01-01T00:00:00Z',
};

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture:   ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    const userSvc  = { getProfile: jest.fn().mockReturnValue(of(mockProfile)), updateProfile: jest.fn() };
    const authSvc  = {
      currentUser:      signal<{ user_id: string; email: string; full_name: string } | null>({
        user_id: 'u-1', email: 'test@example.com', full_name: 'Ana Torres',
      }),
      isAuthenticated:  signal(true),
      getTokenPayload:  jest.fn().mockReturnValue({ user_id: 'u-1', email: 'test@example.com', exp: Math.floor(Date.now() / 1000) + 3600 }),
      getToken:         jest.fn().mockReturnValue('token'),
      requestRecovery:  jest.fn().mockReturnValue(of(void 0)),
      logout:           jest.fn().mockReturnValue(of(void 0)),
    };
    const themeSvc = { isDark: signal(false), toggleDarkMode: jest.fn() };
    const snackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: UserService,  useValue: userSvc },
        { provide: AuthService,  useValue: authSvc },
        { provide: ThemeService, useValue: themeSvc },
        { provide: MatSnackBar,  useValue: snackBar },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra ProfileFormComponent con datos del servicio', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-profile-form')).not.toBeNull();
  });

  it('muestra email del usuario en SessionInfoComponent — E1-HU05-S01', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-session-info')).not.toBeNull();
    expect(el.textContent).toContain('test@example.com');
  });
});
