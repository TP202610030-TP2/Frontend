import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { UploadProgressComponent } from './upload-progress.component';

describe('UploadProgressComponent', () => {
  let fixture:   ComponentFixture<UploadProgressComponent>;
  let component: UploadProgressComponent;

  beforeEach(async () => {
    jest.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [UploadProgressComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture   = TestBed.createComponent(UploadProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
    component.ngOnDestroy();
  });

  it('muestra el primer mensaje al iniciar', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('incrementa elapsed en el timer', () => {
    expect(component.elapsed()).toBe(0);
    jest.advanceTimersByTime(3000);
    expect(component.elapsed()).toBe(3);
  });

  it('ngOnDestroy limpia el intervalo', () => {
    component.ngOnDestroy();
    const before = component.elapsed();
    jest.advanceTimersByTime(5000);
    expect(component.elapsed()).toBe(before);
  });
});
