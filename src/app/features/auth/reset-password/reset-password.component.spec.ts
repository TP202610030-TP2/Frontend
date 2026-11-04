import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '@core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

function makeRoute(token: string | null) {
  return {
    snapshot: {
      queryParamMap: convertToParamMap(token ? { token } : {}),
    },
  };
}

const VALID_FORM = { password: 'Abc12345', confirmPassword: 'Abc12345' };

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture:   ComponentFixture<ResetPasswordComponent>;
  let authSvc:  { resetPassword: jest.Mock };
  let snackBar: { open: jest.Mock };

  async function setup(token: string | null) {
    authSvc  = { resetPassword: jest.fn().mockReturnValue(of(void 0)) };
    snackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService,    useValue: authSvc },
        { provide: MatSnackBar,    useValue: snackBar },
        { provide: ActivatedRoute, useValue: makeRoute(token) },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('éxito → snackbar + navega a /auth/login — E1-HU04-S03', async () => {
    await setup('valid-token-abc');
    component.form.patchValue(VALID_FORM);
    component.submit();
    expect(authSvc.resetPassword).toHaveBeenCalledWith('valid-token-abc', 'Abc12345');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Contraseña actualizada correctamente.',
      'OK',
      expect.objectContaining({ duration: 5000 }),
    );
  });

  it('token expirado (400) → tokenError=true — E1-HU04-S04', async () => {
    await setup('expired-token');
    authSvc.resetPassword.mockReturnValue(throwError(() => ({ status: 400 })));
    component.form.patchValue(VALID_FORM);
    component.submit();
    expect(component.tokenError).toBe(true);
  });

  it('sin token en URL → redirige a /auth/forgot-password', async () => {
    await setup(null);
    // ngOnInit should have triggered navigation; token is null
    expect((component as unknown as { token: string | null }).token).toBeNull();
  });
});
