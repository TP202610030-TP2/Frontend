import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SimpleChange } from '@angular/core';

import { StreamControlsComponent } from './stream-controls.component';

describe('StreamControlsComponent', () => {
  let fixture:   ComponentFixture<StreamControlsComponent>;
  let component: StreamControlsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamControlsComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture   = TestBed.createComponent(StreamControlsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('status idle → muestra botón Iniciar grabación', () => {
    component.status = 'idle';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Iniciar grabación');
  });

  it('status live → muestra badge EN VIVO y botón Detener', () => {
    component.status = 'idle';
    fixture.detectChanges();
    component.status = 'live';
    component.ngOnChanges({ status: new SimpleChange('idle', 'live', false) });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('EN VIVO');
    expect(el.textContent).toContain('Detener');
  });

  it('status connecting → muestra spinner y texto conectando', () => {
    component.status = 'connecting';
    component.ngOnChanges({ status: new SimpleChange('idle', 'connecting', false) });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Conectando');
  });

  it('formatTime convierte segundos a MM:SS', () => {
    expect(component.formatTime(0)).toBe('00:00');
    expect(component.formatTime(65)).toBe('01:05');
    expect(component.formatTime(3600)).toBe('60:00');
  });

  it('ngOnDestroy limpia el timer', () => {
    component.status = 'live';
    component.ngOnChanges({ status: new SimpleChange('idle', 'live', false) });
    component.ngOnDestroy();
    expect(component['intervalId']).toBeNull();
  });
});
