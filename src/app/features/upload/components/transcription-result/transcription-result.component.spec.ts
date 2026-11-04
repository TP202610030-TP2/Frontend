import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranscriptionResultComponent } from './transcription-result.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { TranscribeResponse } from '@core/models/transcription.models';

const MOCK_RESULT: TranscribeResponse = {
  audio_id:           'a1',
  processed_path:     '/tmp/a1.wav',
  metadata:           { format: 'wav', duration: 93, sampleRate: 16000, bitRate: 256000, channels: 1, codec: null },
  transcription_id:   't-abc123',
  transcription_text: 'Texto transcrito de prueba en quechua',
};

describe('TranscriptionResultComponent', () => {
  let component: TranscriptionResultComponent;
  let fixture:   ComponentFixture<TranscriptionResultComponent>;
  let snackBar:  { open: jest.Mock };

  beforeEach(async () => {
    snackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [TranscriptionResultComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(TranscriptionResultComponent);
    component = fixture.componentInstance;
    component.result   = MOCK_RESULT;
    component.fileName = 'grabacion.wav';
    fixture.detectChanges();
  });

  it('muestra el texto de transcripción — E2-HU02-S01 / S03', () => {
    expect(component.result.transcription_text).toBe('Texto transcrito de prueba en quechua');
    expect(component.result.transcription_id).toBe('t-abc123');
  });

  it('copyText() llama navigator.clipboard.writeText — E2-HU02-S03', () => {
    const mockClipboard = { writeText: jest.fn().mockResolvedValue(undefined) };
    Object.defineProperty(navigator, 'clipboard', { value: mockClipboard, configurable: true });

    component.copyText();
    expect(mockClipboard.writeText).toHaveBeenCalledWith('Texto transcrito de prueba en quechua');
  });
});
