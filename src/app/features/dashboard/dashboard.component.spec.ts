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
  let dashSvc:  { getDashboard: jest.Mock; getServices: jest.Mock };
  let authSvc:  { currentUser: ReturnType<typeof signal> };

  beforeEach(async () => {
    dashSvc = {
      getDashboard: jest.fn().mockReturnValue(of(MOCK_DATA)),
      getServices:  jest.fn().mockReturnValue(of(MOCK_DATA.services)),
    };
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

  it('última actividad muestra fecha y hora compactas', () => {
    fixture.detectChanges();
    expect(component.latestAt()).toBe('2026-06-10T15:30:00Z');
    expect(component.latestAtLabel()).toMatch(/2026 · \d{2}:\d{2}$/);
  });

  describe('re-comprobación del estado de servicios', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
      fixture.destroy();
      jest.useRealTimers();
    });

    it('vuelve a comprobar servicios que aún no responden hasta que estén operativos', () => {
      dashSvc.getDashboard.mockReturnValue(of({
        ...MOCK_DATA,
        services: { ...MOCK_DATA.services, asr: 'unavailable' },
      }));
      fixture.detectChanges();
      expect(component.checkingServices()).toBe(true);
      expect(dashSvc.getServices).not.toHaveBeenCalled();

      jest.advanceTimersByTime(DashboardComponent.RETRY_MS);
      expect(dashSvc.getServices).toHaveBeenCalledTimes(1);
      expect(component.services()?.asr).toBe('healthy');
      expect(component.checkingServices()).toBe(false);
    });

    it('tras agotar los reintentos deja de mostrar "Verificando" y marca no disponible', () => {
      const down = { ...MOCK_DATA.services, asr: 'unavailable' as const };
      dashSvc.getDashboard.mockReturnValue(of({ ...MOCK_DATA, services: down }));
      dashSvc.getServices.mockReturnValue(of(down));
      fixture.detectChanges();

      jest.advanceTimersByTime(DashboardComponent.RETRY_MS * DashboardComponent.MAX_RETRIES);
      expect(dashSvc.getServices).toHaveBeenCalledTimes(DashboardComponent.MAX_RETRIES);
      expect(component.checkingServices()).toBe(false);
    });
  });
});
