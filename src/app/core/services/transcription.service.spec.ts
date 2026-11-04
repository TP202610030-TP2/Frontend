import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { TranscriptionService } from './transcription.service';
import { TranscriptionListResponse } from '@core/models/transcription.models';
import { API } from '@core/api/endpoints.registry';
import { environment as env } from '@env/environment';

describe('TranscriptionService', () => {
  let service: TranscriptionService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service    = TestBed.inject(TranscriptionService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('getList retorna lista con campo transcriptions (no items) y paginación — E2-HU05-S01', () => {
    const mockList: TranscriptionListResponse = {
      transcriptions: [
        { transcription_id: 'tr1', text: 'Hola', audio_filename: 'a.wav', audio_duration: 3, created_at: '' },
      ],
      pagination: { current_page: 1, page_size: 10, total_pages: 1, total_items: 1 },
    };

    service.getList().subscribe(res => {
      expect(res.transcriptions).toHaveLength(1);
      expect(res.pagination.current_page).toBe(1);
      expect(res.pagination.total_items).toBe(1);
    });

    controller.expectOne(r => r.url.includes(API.transcription.list.path)).flush(mockList);
  });

  it('getList con lista vacía retorna transcriptions: [] — E2-HU05-S03', () => {
    const empty: TranscriptionListResponse = {
      transcriptions: [],
      pagination: { current_page: 1, page_size: 10, total_pages: 0, total_items: 0 },
    };
    service.getList().subscribe(res => expect(res.transcriptions).toHaveLength(0));
    controller.expectOne(r => r.url.includes(API.transcription.list.path)).flush(empty);
  });

  it('getDetail retorna transcripción con confidence_scores — E2-HU05-S02', () => {
    const detail = {
      transcription_id: 'tr1', user_id: 'u1', audio_id: 'a1',
      text: 'Hola', audio_filename: 'a.wav', audio_duration: 3,
      processing_time: 1.2, created_at: '',
      confidence_scores: [{ word: 'Hola', confidence: 0.95, start_time: 0, end_time: 0.5 }],
    };
    service.getDetail('tr1').subscribe(res => {
      expect(res.confidence_scores).toHaveLength(1);
      expect(res.confidence_scores[0].word).toBe('Hola');
    });
    controller.expectOne(r => r.url.includes('tr1')).flush(detail);
  });
});
