import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AudioDropzoneComponent } from './audio-dropzone.component';

describe('AudioDropzoneComponent', () => {
  let component: AudioDropzoneComponent;
  let fixture:   ComponentFixture<AudioDropzoneComponent>;
  let fileSelectedSpy:    jest.Mock;
  let validationErrorSpy: jest.Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioDropzoneComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture   = TestBed.createComponent(AudioDropzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    fileSelectedSpy    = jest.fn();
    validationErrorSpy = jest.fn();
    component.fileSelected.subscribe(fileSelectedSpy);
    component.validationError.subscribe(validationErrorSpy);
  });

  it('archivo WAV válido → fileSelected emitido — E2-HU01-S01 / E2-HU04-S01', () => {
    const file = new File(['audio'], 'grabacion.wav', { type: 'audio/wav' });
    component.handleFile(file);
    expect(fileSelectedSpy).toHaveBeenCalledWith(file);
    expect(validationErrorSpy).not.toHaveBeenCalled();
  });

  it('archivo .exe → validationError emitido — E2-HU01-S02', () => {
    const file = { name: 'virus.exe', size: 1024, type: 'application/exe' } as File;
    component.handleFile(file);
    expect(validationErrorSpy).toHaveBeenCalled();
    expect(fileSelectedSpy).not.toHaveBeenCalled();
  });

  it('archivo de 55 MB → validationError emitido — E2-HU04-S02', () => {
    const bigFile = { name: 'grande.wav', size: 55 * 1024 * 1024, type: 'audio/wav' } as File;
    component.handleFile(bigFile);
    expect(validationErrorSpy).toHaveBeenCalled();
    expect(fileSelectedSpy).not.toHaveBeenCalled();
  });
});
