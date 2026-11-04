import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '@core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture:   ComponentFixture<LoginComponent>;
  let authSvc:  { login: jest.Mock };
  let snackBar: { open: jest.Mock };

  beforeEach(async () => {
    authSvc  = { login: jest.fn().mockReturnValue(of({})) };
    snackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService,  useValue: authSvc },
        { provide: MatSnackBar,  useValue: snackBar },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('formulario válido → AuthService.login() llamado — E1-HU02-S01', () => {
    component.form.patchValue({ email: 'a@a.com', password: 'Abc12345' });
    component.submit();
    expect(authSvc.login).toHaveBeenCalledWith({ email: 'a@a.com', password: 'Abc12345' });
  });

  it('error del servicio → snackbar mostrado — E1-HU02-S02', () => {
    authSvc.login.mockReturnValue(throwError(() => ({ status: 401 })));
    component.form.patchValue({ email: 'a@a.com', password: 'wrong123' });
    component.submit();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Correo o contraseña incorrectos. Verifica tus datos.',
      'Cerrar',
      expect.objectContaining({ duration: 5000 }),
    );
  });

  it('formulario inválido → submit no llama al servicio', () => {
    component.form.patchValue({ email: '', password: '' });
    component.submit();
    expect(authSvc.login).not.toHaveBeenCalled();
  });
});
