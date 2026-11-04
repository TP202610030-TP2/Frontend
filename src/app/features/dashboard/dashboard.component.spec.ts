import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '@core/services/dashboard.service';
import { AuthService } from '@core/services/auth.service';
import type { DashboardData } from '@core/models/dashboard.models';

const MOCK_DATA: DashboardData = {
  user: { user_id: 'u1', email: 'ana@example.com', full_name: 'Ana García', account_status: 'active' },
  transcription_summary: { total: 12, latest_at: '2026-06-10T15:30:00Z' },
  services: {
    'auth':                  'healthy',
    'audio-processor':       'healthy',
    'asr':                   'healthy',
    'transcription-manager': 'healthy',
  },
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture:   ComponentFixture<DashboardComponent>;
  let dashSvc:  { getDashboard: jest.Mock };
  let authSvc:  { currentUser: ReturnType<typeof signal> };

  beforeEach(async () => {
    dashSvc = { getDashboard: jest.fn().mockReturnValue(of(MOCK_DATA)) };
    authSvc = { currentUser: signal({ user_id: 'u1', email: 'ana@example.com', full_name: '' }) };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: DashboardService, useValue: dashSvc },
        { provide: AuthService,      useValue: authSvc },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('muestra nombre del usuario de full_name — E1-HU06-S01', () => {
    fixture.detectChanges();
    expect(component.userName()).toBe('Ana García');
  });

  it('services signal contiene datos del backend y total correcto — E4-HU03-S01', () => {
    fixture.detectChanges();
    expect(component.services()?.['auth']).toBe('healthy');
    expect(component.totalTranscriptions()).toBe(12);
  });

  it('error en API → hasError = true — E1-HU06-S03', () => {
    dashSvc.getDashboard.mockReturnValue(throwError(() => ({ status: 503 })));
    fixture.detectChanges();
    expect(component.hasError()).toBe(true);
    expect(component.loading()).toBe(false);
  });
});
