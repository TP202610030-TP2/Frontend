import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { HistoryListComponent } from './history-list.component';
import { TranscriptionService } from '@core/services/transcription.service';
import type { TranscriptionListResponse } from '@core/models/transcription.models';

const mockItem = {
  transcription_id: 'abc-1',
  text: 'Imaynallan kashanki warmiy',
  audio_filename: 'sample.wav',
  audio_duration: 90,
  created_at: new Date().toISOString(),
};

const mockResponse: TranscriptionListResponse = {
  transcriptions: [mockItem],
  pagination: { current_page: 1, page_size: 10, total_pages: 1, total_items: 1 },
};

describe('HistoryListComponent', () => {
  let component: HistoryListComponent;
  let fixture:   ComponentFixture<HistoryListComponent>;
  let transcriptionSvc: { getList: jest.Mock };

  function setup(response$: ReturnType<typeof of>) {
    transcriptionSvc = { getList: jest.fn().mockReturnValue(response$) };
    return TestBed.configureTestingModule({
      imports: [HistoryListComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: TranscriptionService, useValue: transcriptionSvc },
      ],
    }).compileComponents();
  }

  it('lista transcripciones al cargar — E2-HU05-S01', async () => {
    await setup(of(mockResponse));
    fixture   = TestBed.createComponent(HistoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(transcriptionSvc.getList).toHaveBeenCalledWith(1, 10);
    expect(component.items()).toHaveLength(1);
    expect(component.loading()).toBe(false);
    expect(component.hasError()).toBe(false);
  });

  it('sin resultados → EmptyStateComponent visible — E2-HU05-S03', async () => {
    const empty: TranscriptionListResponse = {
      transcriptions: [],
      pagination: { current_page: 1, page_size: 10, total_pages: 0, total_items: 0 },
    };
    await setup(of(empty));
    fixture   = TestBed.createComponent(HistoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.items()).toHaveLength(0);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-empty-state')).not.toBeNull();
  });

  it('error de red → hasError = true — E2-HU05-S02', async () => {
    await setup(throwError(() => ({ status: 503 })));
    fixture   = TestBed.createComponent(HistoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    expect(component.loading()).toBe(false);
  });
});
