import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;
  let component: StatusBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('status healthy → clase verde e ícono check_circle', () => {
    component.status = 'healthy';
    component.label  = 'Auth';
    fixture.detectChanges();
    expect(component.badgeClass).toContain('green');
    expect(component.icon).toBe('check_circle');
  });

  it('status unhealthy → clase roja e ícono error', () => {
    component.status = 'unhealthy';
    component.label  = 'DB';
    fixture.detectChanges();
    expect(component.badgeClass).toContain('red');
    expect(component.icon).toBe('error');
  });

  it('status unknown → clase gris e ícono help', () => {
    component.status = 'unknown';
    component.label  = 'Cache';
    fixture.detectChanges();
    expect(component.badgeClass).toContain('gray');
    expect(component.icon).toBe('help');
  });

  it('aria-label contiene el label y el statusLabel', () => {
    component.status = 'healthy';
    component.label  = 'API';
    fixture.detectChanges();
    const span = (fixture.nativeElement as HTMLElement).querySelector('span');
    expect(span?.getAttribute('aria-label')).toContain('API');
    expect(span?.getAttribute('aria-label')).toContain('activo');
  });
});
