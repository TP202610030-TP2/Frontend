import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { AppShellComponent } from './app-shell.component';
import { AuthService } from '@core/services/auth.service';

describe('AppShellComponent', () => {
  let fixture:   ComponentFixture<AppShellComponent>;
  let component: AppShellComponent;

  function buildAuthSvc(user: { user_id: string; email: string; full_name: string } | null) {
    return {
      currentUser:     signal(user),
      isAuthenticated: signal(user !== null),
    };
  }

  async function setup(user: { user_id: string; email: string; full_name: string } | null) {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: buildAuthSvc(user) },
      ],
    }).compileComponents();
    fixture   = TestBed.createComponent(AppShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('userName muestra full_name cuando existe', async () => {
    await setup({ user_id: 'u1', email: 'test@x.com', full_name: 'Ana Torres' });
    expect(component.userName()).toBe('Ana Torres');
  });

  it('userName fallback al prefijo del email cuando full_name está vacío', async () => {
    await setup({ user_id: 'u1', email: 'rodrigo@x.com', full_name: '' });
    expect(component.userName()).toBe('rodrigo');
  });

  it('userEmail devuelve el email del usuario', async () => {
    await setup({ user_id: 'u1', email: 'test@x.com', full_name: 'Ana' });
    expect(component.userEmail()).toBe('test@x.com');
  });
});
