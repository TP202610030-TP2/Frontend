import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { AudioUploadService } from './audio-upload.service';
import { TranscribeResponse } from '@core/models/transcription.models';
import { API } from '@core/api/endpoints.registry';
import { environment as env } from '@env/environment';

const mockResponse: TranscribeResponse = {
  audio_id:           'a1',
  processed_path:     '/processed/test.wav',
  metadata:           { format: 'wav', duration: 5, sampleRate: 16000, bitRate: 128000, channels: 1, codec: null },
  transcription_id:   'tr1',
  transcription_text: 'Hola mundo en Quechua',
};

describe('AudioUploadService', () => {
  let service: AudioUploadService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service    = TestBed.inject(AudioUploadService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('uploadAudio con archivo válido → estado success y uploadResult poblado — E2-HU01-S01', () => {
    const file = new File(['audio'], 'test.wav', { type: 'audio/wav' });
    service.uploadAudio(file);

    expect(service.uploadState()).toBe('uploading');

    const req = controller.expectOne(`${env.apiUrl}${API.transcription.upload.path}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.uploadState()).toBe('success');
    expect(service.uploadResult()).toEqual(mockResponse);
  });

  it('uploadAudio con error 400 → estado error y errorMessage — E2-HU02-S02', () => {
    const file = new File(['bad'], 'corrupt.wav', { type: 'audio/wav' });
    service.uploadAudio(file);

    controller.expectOne(`${env.apiUrl}${API.transcription.upload.path}`)
      .flush({ message: 'Invalid audio file' }, { status: 400, statusText: 'Bad Request' });

    expect(service.uploadState()).toBe('error');
    expect(service.errorMessage()).not.toBe('');
  });

  it('download retorna Blob con filename extraído de Content-Disposition — E2-HU06-S01', () => {
    service.download('tr1', 'txt').subscribe(result => {
      expect(result.filename).toBe('transcripcion.txt');
      expect(result.blob).toBeTruthy();
    });

    const req = controller.expectOne(r => r.url.includes('download'));
    req.flush(new Blob(['texto']), {
      headers: { 'Content-Disposition': 'attachment; filename="transcripcion.txt"' },
    });
  });

  it('reset vuelve estado a idle', () => {
    service.uploadAudio(new File(['x'], 'x.wav'));
    controller.expectOne(`${env.apiUrl}${API.transcription.upload.path}`).flush(mockResponse);
    expect(service.uploadState()).toBe('success');

    service.reset();

    expect(service.uploadState()).toBe('idle');
    expect(service.uploadResult()).toBeNull();
  });
});
