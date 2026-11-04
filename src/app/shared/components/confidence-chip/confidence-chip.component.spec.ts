import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfidenceChipComponent } from './confidence-chip.component';

describe('ConfidenceChipComponent', () => {
  let fixture: ComponentFixture<ConfidenceChipComponent>;
  let component: ConfidenceChipComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfidenceChipComponent],
    }).compileComponents();
    fixture   = TestBed.createComponent(ConfidenceChipComponent);
    component = fixture.componentInstance;
  });

  it('≥ 0.8 → chip verde', () => {
    component.confidence = 0.92;
    fixture.detectChanges();
    expect(component.chipClass).toContain('green');
  });

  it('≥ 0.5 y < 0.8 → chip amarillo', () => {
    component.confidence = 0.65;
    fixture.detectChanges();
    expect(component.chipClass).toContain('yellow');
  });

  it('< 0.5 → chip rojo', () => {
    component.confidence = 0.3;
    fixture.detectChanges();
    expect(component.chipClass).toContain('red');
  });

  it('muestra el porcentaje y aria-label correcto', () => {
    component.confidence = 0.75;
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('75%');
    expect(el.querySelector('span')?.getAttribute('aria-label')).toContain('75%');
  });
});
