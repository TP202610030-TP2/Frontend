import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { HistoryDetailComponent } from './history-detail.component';
import { TranscriptionService } from '@core/services/transcription.service';
import type { TranscriptionDetail } from '@core/models/transcription.models';

const mockDetail: TranscriptionDetail = {
  transcription_id:  'abc-1',
  user_id:           'u-1',
  audio_id:          'aud-1',
  text:              'Imaynallan kashanki warmiy',
  audio_filename:    'sample.wav',
  audio_duration:    90,
  processing_time:   1.23,
  created_at:        new Date().toISOString(),
  confidence_scores: [
    { word: 'Imaynallan', confidence: 0.92, start_time: 0.0, end_time: 0.8 },
    { word: 'kashanki',   confidence: 0.45, start_time: 0.9, end_time: 1.5 },
  ],
};

function buildRoute(id: string | null) {
  return {
    snapshot: { paramMap: convertToParamMap(id ? { id } : {}) },
  };
}

describe('HistoryDetailComponent', () => {
  let component: HistoryDetailComponent;
  let fixture:   ComponentFixture<HistoryDetailComponent>;

  async function setup(id: string | null, response$: ReturnType<typeof of>) {
    const transcriptionSvc = { getDetail: jest.fn().mockReturnValue(response$), download: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [HistoryDetailComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ActivatedRoute,       useValue: buildRoute(id) },
        { provide: TranscriptionService, useValue: transcriptionSvc },
      ],
    }).compileComponents();
    fixture   = TestBed.createComponent(HistoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('carga detalle correctamente — E2-HU06-S01', async () => {
    await setup('abc-1', of(mockDetail));
    expect(component.detail()?.transcription_id).toBe('abc-1');
    expect(component.loading()).toBe(false);
    expect(component.errorCode()).toBeNull();
  });

  it('error 403 → errorCode = 403 — E2-HU06-S02', async () => {
    await setup('abc-1', throwError(() => ({ status: 403 })));
    expect(component.errorCode()).toBe(403);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No tienes acceso a esta transcripción.');
  });

  it('error 404 → errorCode = 404 — E2-HU06-S03', async () => {
    await setup('nonexistent', throwError(() => ({ status: 404 })));
    expect(component.errorCode()).toBe(404);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Transcripción no encontrada.');
  });
});
