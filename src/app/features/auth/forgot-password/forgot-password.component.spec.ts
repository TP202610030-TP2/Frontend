import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ForgotPasswordComponent, RECOVERY_MSG } from './forgot-password.component';
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

  it('confirma el envío de instrucciones al correo registrado — CP007', () => {
    component.form.patchValue({ email: 'user@example.com' });
    component.submit();
    expect(authSvc.requestRecovery).toHaveBeenCalledWith('user@example.com');
    expect(component.submitted).toBe(true);
    expect(component.errorMsg).toBeNull();
    expect(component.successMsg).toBe(RECOVERY_MSG.sent('user@example.com'));
  });

  it('informa que el usuario no fue encontrado (404) — CP008', () => {
    authSvc.requestRecovery.mockReturnValue(throwError(() => ({ status: 404 })));
    component.form.patchValue({ email: 'noexiste@example.com' });
    component.submit();
    fixture.detectChanges();
    expect(component.submitted).toBe(false);
    expect(component.errorMsg).toBe(RECOVERY_MSG.notFound);
    const alert = fixture.nativeElement.querySelector('[data-testid="recovery-error"]');
    expect(alert.textContent).toContain('No se encontró ningún usuario registrado');
  });

  it('informa cuando el correo no pudo enviarse (503)', () => {
    authSvc.requestRecovery.mockReturnValue(throwError(() => ({ status: 503 })));
    component.form.patchValue({ email: 'user@example.com' });
    component.submit();
    expect(component.submitted).toBe(false);
    expect(component.errorMsg).toBe(RECOVERY_MSG.emailFailed);
  });
});
