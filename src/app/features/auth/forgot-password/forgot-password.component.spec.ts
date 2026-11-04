import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '@core/services/auth.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture:   ComponentFixture<ForgotPasswordComponent>;
  let authSvc:  { requestRecovery: jest.Mock };

  beforeEach(async () => {
    authSvc = { requestRecovery: jest.fn().mockReturnValue(of(void 0)) };

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authSvc },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra mensaje genérico tras envío (éxito) — E1-HU04-S01', () => {
    component.form.patchValue({ email: 'user@example.com' });
    component.submit();
    expect(component.submitted).toBe(true);
    expect(component.genericMsg).toContain('Si el correo existe en nuestro sistema');
  });

  it('muestra mismo mensaje genérico aunque el servicio falle — E1-HU04-S02', () => {
    authSvc.requestRecovery.mockReturnValue(throwError(() => ({ status: 404 })));
    component.form.patchValue({ email: 'noexiste@example.com' });
    component.submit();
    expect(component.submitted).toBe(true);
  });
});
