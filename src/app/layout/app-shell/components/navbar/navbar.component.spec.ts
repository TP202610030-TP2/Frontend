import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { NavbarComponent } from './navbar.component';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { MatDialog } from '@angular/material/dialog';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture:   ComponentFixture<NavbarComponent>;
  let authSvc:  { logout: jest.Mock };
  let dialog:   { open: jest.Mock };
  let themeSvc: { isDark: ReturnType<typeof signal<boolean>>; toggleDarkMode: jest.Mock };

  beforeEach(async () => {
    authSvc  = { logout: jest.fn().mockReturnValue(of(void 0)) };
    dialog   = { open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }) };
    themeSvc = { isDark: signal(false), toggleDarkMode: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService,  useValue: authSvc  },
        { provide: ThemeService, useValue: themeSvc },
        { provide: MatDialog,    useValue: dialog   },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('logout abre diálogo de confirmación y al confirmar llama al servicio — E1-HU05-S01', () => {
    component.onLogoutClick();
    expect(dialog.open).toHaveBeenCalled();
    expect(authSvc.logout).toHaveBeenCalled();
  });
});
