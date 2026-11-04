import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { DownloadButtonsComponent } from './download-buttons.component';
import { AudioUploadService } from '@core/services/audio-upload.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('DownloadButtonsComponent', () => {
  let component: DownloadButtonsComponent;
  let fixture:   ComponentFixture<DownloadButtonsComponent>;
  let uploadSvc: { download: jest.Mock };
  let snackBar:  { open: jest.Mock };

  beforeEach(async () => {
    uploadSvc = { download: jest.fn().mockReturnValue(of({ blob: new Blob(['test']), filename: 'test.txt' })) };
    snackBar  = { open: jest.fn() };

    // Mock URL API
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock');
    global.URL.revokeObjectURL = jest.fn();

    await TestBed.configureTestingModule({
      imports: [DownloadButtonsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AudioUploadService, useValue: uploadSvc },
        { provide: MatSnackBar,        useValue: snackBar },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(DownloadButtonsComponent);
    component = fixture.componentInstance;
    component.transcriptionId = 't-abc123';
    fixture.detectChanges();
  });

  it('click TXT → download llamado con format="txt" — E2-HU06-S01 / S02', () => {
    component.onDownload('txt');
    expect(uploadSvc.download).toHaveBeenCalledWith('t-abc123', 'txt');
    expect(snackBar.open).toHaveBeenCalledWith('Descarga iniciada.', 'OK', expect.any(Object));
  });

  it('error de descarga → snackbar "No se pudo generar el archivo" — E2-HU06-S03', () => {
    uploadSvc.download.mockReturnValue(throwError(() => ({ status: 500 })));
    component.onDownload('srt');
    expect(snackBar.open).toHaveBeenCalledWith(
      'No se pudo generar el archivo.',
      'Cerrar',
      expect.any(Object),
    );
  });
});
