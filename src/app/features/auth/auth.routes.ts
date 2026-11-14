import { Routes } from '@angular/router';
import { publicGuard } from '@core/guards/public.guard';

export const authRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    title: 'Iniciar sesión',
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    title: 'Crear cuenta',
  },
  {
    path: 'forgot-password',
    canActivate: [publicGuard],
    loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Recuperar contraseña',
  },
  {
    path: 'reset-password',
    // Sin publicGuard: el enlace del correo funciona aunque haya sesión abierta.
    loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    title: 'Nueva contraseña',
  },
];
