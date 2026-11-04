import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DocsComponent } from './docs.component';
import { AuthService } from '@core/services/auth.service';
import { environment as env } from '@env/environment';

describe('DocsComponent', () => {
  let component: DocsComponent;
  let fixture:   ComponentFixture<DocsComponent>;

  let isAuthenticated: ReturnType<typeof signal<boolean>>;
  let authSvc: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    getToken: jest.Mock;
  };
  let snackBar: { open: jest.Mock };

  beforeEach(async () => {
    isAuthenticated = signal(true);
    authSvc = {
      isAuthenticated,
      getToken: jest.fn().mockReturnValue('test-jwt-token'),
    };
    snackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [DocsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AuthService, useValue: authSvc },
        { provide: MatSnackBar,  useValue: snackBar },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(DocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('iframe src apunta a la URL correcta de environment — E3-HU02-S01', () => {
    const el      = fixture.nativeElement as HTMLElement;
    const iframe  = el.querySelector('iframe');
    expect(iframe).not.toBeNull();
    // Angular DomSanitizer wraps the URL; check the component property directly
    const url = String(component.safeSwaggerUrl);
    expect(url).toContain(env.swaggerUrl);
  });

  it('botón copiar llama a clipboard.writeText con el token — E3-HU02-S03', async () => {
    const writeMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(global.navigator, 'clipboard', {
      value:    { writeText: writeMock },
      writable: true,
    });

    component.copyToken();
    await Promise.resolve();

    expect(writeMock).toHaveBeenCalledWith('test-jwt-token');
    expect(snackBar.open).toHaveBeenCalledWith(
      'JWT copiado al portapapeles', 'OK', expect.any(Object),
    );
  });

  it('botón copiar no visible cuando el usuario no está autenticado — E3-HU03', () => {
    isAuthenticated.set(false);
    fixture.detectChanges();

    const el  = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('button');
    expect(btn).toBeNull();
  });
});
