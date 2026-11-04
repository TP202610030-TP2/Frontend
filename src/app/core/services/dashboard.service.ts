import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment as env } from '@env/environment';
import { API } from '@core/api/endpoints.registry';
import { DashboardData, DashboardResponse } from '@core/models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  /** GET /api/v1/dashboard — devuelve ApiEnvelope<DashboardData>, desenvuelve data */
  getDashboard(): Observable<DashboardData> {
    return this.http
      .get<DashboardResponse>(`${env.apiUrl}${API.dashboard.summary.path}`)
      .pipe(map(r => r.data!));
  }
}
