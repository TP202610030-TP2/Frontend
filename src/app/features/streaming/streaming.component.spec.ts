import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { StreamingComponent } from './streaming.component';
import { StreamingService, StreamingStatus } from '@core/services/streaming.service';
import { AuthService } from '@core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AudioUploadService } from '@core/services/audio-upload.service';

describe('StreamingComponent', () => {
  let component: StreamingComponent;
  let fixture:   ComponentFixture<StreamingComponent>;

  let status:               ReturnType<typeof signal<StreamingStatus>>;
  let partialText:          ReturnType<typeof signal<string>>;
  let finalText:            ReturnType<typeof signal<string>>;
  let errorMessage:         ReturnType<typeof signal<string>>;
  let finalTranscriptionId: ReturnType<typeof signal<string | null>>;
  let streamSvc: Record<string, unknown>;
  let authSvc:   { getToken: jest.Mock };
  let snackBar:  { open: jest.Mock };
  let uploadSvc: { download: jest.Mock; uploadState: unknown; uploadResult: unknown; errorMessage: unknown };

  beforeEach(async () => {
    status               = signal<StreamingStatus>('idle');
    partialText          = signal('');
    finalText            = signal('');
    errorMessage         = signal('');
    finalTranscriptionId = signal<string | null>(null);

    streamSvc = { status, partialText, finalText, errorMessage, finalTranscriptionId, start: jest.fn(), stop: jest.fn(), cleanup: jest.fn(), reset: jest.fn() };
    authSvc   = { getToken: jest.fn().mockReturnValue('test-token') };
    snackBar  = { open: jest.fn() };
    uploadSvc = { download: jest.fn(), uploadState: signal('idle'), uploadResult: signal(null), errorMessage: signal('') };

    await TestBed.configureTestingModule({
      imports: [StreamingComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: StreamingService,  useValue: streamSvc },
        { provide: AuthService,       useValue: authSvc },
        { provide: MatSnackBar,       useValue: snackBar },
        { provide: AudioUploadService, useValue: uploadSvc },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(StreamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sin soporte AudioContext → unsupportedBrowser = true', () => {
    const original = (global as Record<string, unknown>)['AudioContext'];
    delete (global as Record<string, unknown>)['AudioContext'];

    component.ngOnInit();
    expect(component.unsupportedBrowser).toBe(true);

    (global as Record<string, unknown>)['AudioContext'] = original;
  });

  it('status live → isLive() = true — E2-HU03-S01', () => {
    status.set('live');
    expect(component.isLive()).toBe(true);
    expect(component.isDone()).toBe(false);
  });

  it('status done → isDone() y streamResult disponibles — E2-HU03-S03', () => {
    finalText.set('Ima suti kay qhichwa simi');
    finalTranscriptionId.set('t-stream-123');
    status.set('done');

    expect(component.isDone()).toBe(true);
    expect(component.streamResult()?.transcription_text).toBe('Ima suti kay qhichwa simi');
    expect(component.streamResult()?.transcription_id).toBe('t-stream-123');
  });
});
