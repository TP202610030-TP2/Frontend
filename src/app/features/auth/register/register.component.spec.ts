import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '@core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const VALID_FORM = {
  fullName:        'Ana García',
  email:           'ana@example.com',
  password:        'Abc12345',
  confirmPassword: 'Abc12345',
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture:   ComponentFixture<RegisterComponent>;
  let authSvc:  { register: jest.Mock };
  let snackBar: { open: jest.Mock };

  beforeEach(async () => {
    authSvc  = { register: jest.fn().mockReturnValue(of({ user_id: 'u1' })) };
    snackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authSvc },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('registro exitoso → navega a /auth/login y muestra snackbar — E1-HU01-S01', () => {
    component.form.patchValue(VALID_FORM);
    component.submit();
    expect(authSvc.register).toHaveBeenCalledWith({
      full_name: 'Ana García',
      email:     'ana@example.com',
      password:  'Abc12345',
    });
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('email duplicado (400) → error inline emailExists — E1-HU01-S02', () => {
    authSvc.register.mockReturnValue(throwError(() => ({ status: 400 })));
    component.form.patchValue(VALID_FORM);
    component.submit();
    expect(component.form.get('email')?.hasError('emailExists')).toBe(true);
  });

  it('contraseñas no coinciden → passwordMatch error en confirmPassword', () => {
    component.form.patchValue({ ...VALID_FORM, confirmPassword: 'Different1' });
    expect(component.form.get('confirmPassword')?.hasError('passwordMatch')).toBe(true);
  });

  it('contraseña sin mayúscula → pattern error', () => {
    component.form.patchValue({ ...VALID_FORM, password: 'abc12345', confirmPassword: 'abc12345' });
    expect(component.form.get('password')?.hasError('pattern')).toBe(true);
  });
});
