import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment as env } from '@env/environment';
import { API, apiPath } from '@core/api/endpoints.registry';
import { TranscribeResponse } from '@core/models/transcription.models';

export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class AudioUploadService {
  private readonly http = inject(HttpClient);

  readonly uploadState  = signal<UploadState>('idle');
  readonly uploadResult = signal<TranscribeResponse | null>(null);
  readonly errorMessage = signal<string>('');

  /** POST /api/v1/transcribe con FormData — sin envelope */
  uploadAudio(file: File): void {
    this.uploadState.set('uploading');
    const form = new FormData();
    form.append('file', file);

    this.http.post<TranscribeResponse>(`${env.apiUrl}${API.transcription.upload.path}`, form).subscribe({
      next: res => {
        this.uploadResult.set(res);
        this.uploadState.set('success');
      },
      error: (err: { userMessage?: string }) => {
        this.errorMessage.set(err.userMessage ?? 'Error al subir el archivo.');
        this.uploadState.set('error');
      },
    });
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

  reset(): void {
    this.uploadState.set('idle');
    this.uploadResult.set(null);
    this.errorMessage.set('');
  }
}
