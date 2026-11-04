import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('botón "Registrarse" apunta a /auth/register', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const link = fixture.debugElement
      .queryAll(By.css('a[mat-raised-button]'))
      .find(el => el.nativeElement.textContent.includes('Registrarse'));
    expect(link).toBeTruthy();
    expect(link!.nativeElement.getAttribute('href')).toBe('/auth/register');
  });

  it('botón "Iniciar sesión" apunta a /auth/login', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const link = fixture.debugElement
      .queryAll(By.css('a[mat-button]'))
      .find(el => el.nativeElement.textContent.includes('Iniciar sesión'));
    expect(link).toBeTruthy();
    expect(link!.nativeElement.getAttribute('href')).toBe('/auth/login');
  });
});
