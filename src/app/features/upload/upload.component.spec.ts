import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { UploadComponent } from './upload.component';
import { AudioUploadService, UploadState } from '@core/services/audio-upload.service';
import type { TranscribeResponse } from '@core/models/transcription.models';

const MOCK_RESULT: TranscribeResponse = {
  audio_id:           'a1',
  processed_path:     '/tmp/a1.wav',
  metadata:           { format: 'wav', duration: 93, sampleRate: 16000, bitRate: 256000, channels: 1, codec: null },
  transcription_id:   't-xyz',
  transcription_text: 'Texto de prueba',
};

describe('UploadComponent', () => {
  let component:   UploadComponent;
  let fixture:     ComponentFixture<UploadComponent>;
  let uploadState: ReturnType<typeof signal<UploadState>>;
  let uploadResult: ReturnType<typeof signal<TranscribeResponse | null>>;
  let errorMessage: ReturnType<typeof signal<string>>;
  let uploadSvc:   { uploadState: unknown; uploadResult: unknown; errorMessage: unknown; uploadAudio: jest.Mock; reset: jest.Mock; download: jest.Mock };

  beforeEach(async () => {
    uploadState  = signal<UploadState>('idle');
    uploadResult = signal<TranscribeResponse | null>(null);
    errorMessage = signal('');

    uploadSvc = {
      uploadState,
      uploadResult,
      errorMessage,
      uploadAudio: jest.fn(),
      reset:       jest.fn(),
      download:    jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AudioUploadService, useValue: uploadSvc },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('en IDLE → isIdle() = true', () => {
    uploadState.set('idle');
    expect(component.isIdle()).toBe(true);
  });

  it('en UPLOADING → isUploading() = true — E2-HU01-S03', () => {
    uploadState.set('uploading');
    expect(component.isUploading()).toBe(true);
  });

  it('en SUCCESS → isSuccess() y uploadResult disponibles — E2-HU02-S01', () => {
    uploadState.set('success');
    uploadResult.set(MOCK_RESULT);
    expect(component.isSuccess()).toBe(true);
    expect(component.uploadResult()).toBe(MOCK_RESULT);
    expect(component.transcriptionId()).toBe('t-xyz');
  });

  it('en ERROR → isError() = true y errorMsg accesible — E2-HU04-S03', () => {
    uploadState.set('error');
    errorMessage.set('El archivo parece estar dañado. Verifica que sea un audio válido.');
    expect(component.isError()).toBe(true);
    expect(component.errorMsg()).toContain('dañado');
  });

  it('en ERROR 413 → errorMsg contiene "50 MB" — E2-HU04-S02', () => {
    uploadState.set('error');
    errorMessage.set('El archivo supera el límite de 50 MB permitido.');
    expect(component.errorMsg()).toContain('50 MB');
  });
});
