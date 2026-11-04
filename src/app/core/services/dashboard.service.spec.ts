import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { DashboardService } from './dashboard.service';
import { DashboardData, DashboardResponse } from '@core/models/dashboard.models';
import { API } from '@core/api/endpoints.registry';
import { environment as env } from '@env/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service    = TestBed.inject(DashboardService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('getDashboard desenvuelve envelope y retorna DashboardData', () => {
    const data: DashboardData = {
      user: { user_id: 'u1', email: 'a@a.com', full_name: 'Ana', account_status: 'active' },
      transcriptions: { total: 5, latest_at: '2026-06-01T00:00:00Z' },
      services: {
        'auth-service': 'healthy', 'user-service': 'healthy',
        'audio-processor': 'healthy', 'transcription-manager': 'healthy',
      },
    };
    const envelope: DashboardResponse = { status: 'success', data, timestamp: '' };

    service.getDashboard().subscribe(result => {
      expect(result.transcriptions.total).toBe(5);
      expect(result.user.full_name).toBe('Ana');
      expect(result.services['auth-service']).toBe('healthy');
    });

    controller.expectOne(`${env.apiUrl}${API.dashboard.summary.path}`).flush(envelope);
  });
});
