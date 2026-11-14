import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [publicGuard],
    title: 'ASR Quechua — Transcripción Automática de Voz',
  },
  {
    path: 'auth',
    // publicGuard se aplica por ruta en auth.routes: /auth/reset-password debe
    // abrirse desde el enlace del correo aunque haya una sesión iniciada.
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard',
      },
      {
        path: 'upload',
        loadComponent: () => import('./features/upload/upload.component').then(m => m.UploadComponent),
        title: 'Transcribir audio',
      },
      {
        path: 'streaming',
        loadComponent: () => import('./features/streaming/streaming.component').then(m => m.StreamingComponent),
        title: 'Streaming en vivo',
      },
      {
        path: 'docs',
        loadComponent: () => import('./features/docs/docs.component').then(m => m.DocsComponent),
        title: 'API Docs',
      },
      {
        path: 'history',
        loadComponent: () => import('./features/history/history-list/history-list.component').then(m => m.HistoryListComponent),
        title: 'Historial',
      },
      {
        path: 'history/:id',
        loadComponent: () => import('./features/history/history-detail/history-detail.component').then(m => m.HistoryDetailComponent),
        title: 'Detalle de transcripción',
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Configuración',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
