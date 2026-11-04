import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment as env } from '@env/environment';
import { API, apiPath } from '@core/api/endpoints.registry';
import {
  TranscriptionDetail,
  TranscriptionListResponse,
} from '@core/models/transcription.models';

@Injectable({ providedIn: 'root' })
export class TranscriptionService {
  private readonly http = inject(HttpClient);

  /** GET /api/v1/transcriptions — respuesta directa sin envelope */
  getList(page = 1, pageSize = 10): Observable<TranscriptionListResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize);
    return this.http.get<TranscriptionListResponse>(
      `${env.apiUrl}${API.transcription.list.path}`,
      { params },
    );
  }

  /** GET /api/v1/transcriptions/:id — respuesta directa sin envelope */
  getDetail(id: string): Observable<TranscriptionDetail> {
    const path = apiPath(API.transcription.detail.path, { id });
    return this.http.get<TranscriptionDetail>(`${env.apiUrl}${path}`);
  }

  /** GET /api/v1/transcriptions/:id/download — extrae filename de Content-Disposition */
  download(id: string, format: 'txt' | 'json' | 'srt'): Observable<{ blob: Blob; filename: string }> {
    const path = apiPath(API.transcription.download.path, { id });
    return this.http
      .get(`${env.apiUrl}${path}?format=${format}`, { responseType: 'blob', observe: 'response' })
      .pipe(
        map(response => {
          const disposition = response.headers.get('Content-Disposition') ?? '';
          const match       = disposition.match(/filename="(.+?)"/);
          return { blob: response.body!, filename: match ? match[1] : `transcripcion.${format}` };
        }),
      );
  }

  delete(id: string): Observable<void> {
    const path = apiPath(API.transcription.delete.path, { id });
    return this.http.delete<void>(`${env.apiUrl}${path}`);
  }

  /** PATCH /api/v1/transcriptions/:id — renombra audio_filename, devuelve la transcripción completa */
  rename(id: string, audioFilename: string): Observable<TranscriptionDetail> {
    const path = apiPath(API.transcription.rename.path, { id });
    return this.http.patch<TranscriptionDetail>(`${env.apiUrl}${path}`, { audio_filename: audioFilename });
  }
}
