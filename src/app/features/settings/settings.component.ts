import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { ThemeService } from '@core/services/theme.service';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { SecuritySectionComponent } from './components/security-section/security-section.component';
import { PreferencesSectionComponent } from './components/preferences-section/preferences-section.component';
import { SessionInfoComponent } from './components/session-info/session-info.component';

const SECTIONS = [
  { id: 'profile',     icon: 'person',           title: 'Datos personales', subtitle: 'Nombre, email, teléfono y fecha de nacimiento' },
  { id: 'security',    icon: 'shield',            title: 'Seguridad',        subtitle: 'Contraseña y opciones de acceso' },
  { id: 'preferences', icon: 'tune',              title: 'Preferencias',     subtitle: 'Tema y configuración de la interfaz' },
  { id: 'session',     icon: 'manage_accounts',   title: 'Sesión activa',    subtitle: 'Información de tu sesión actual' },
] as const;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatCardModule, MatDividerModule, MatIconModule,
    ProfileFormComponent,
    SecuritySectionComponent,
    PreferencesSectionComponent,
    SessionInfoComponent,
  ],
  template: `
    <div class="settings-page">

      <!-- Header -->
      <div class="settings-header">
        <div class="settings-header-inner">
          <div class="header-icon">
            <mat-icon>settings</mat-icon>
          </div>
          <div>
            <h1 class="settings-title">Configuración</h1>
            <p class="settings-subtitle">Personaliza tu cuenta y preferencias</p>
          </div>
        </div>
      </div>

      <!-- Cards -->
      <div class="settings-body">

        <!-- Datos personales -->
        <mat-card class="settings-card">
          <mat-card-header class="card-header">
            <div class="card-header-icon" style="background: rgba(46,125,50,.12)">
              <mat-icon style="color: #2E7D32">person</mat-icon>
            </div>
            <div>
              <mat-card-title class="card-title">Datos personales</mat-card-title>
              <mat-card-subtitle class="card-subtitle">Nombre, email, teléfono y fecha de nacimiento</mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-divider />
          <mat-card-content class="card-body">
            <app-profile-form />
          </mat-card-content>
        </mat-card>

        <!-- Seguridad -->
        <mat-card class="settings-card">
          <mat-card-header class="card-header">
            <div class="card-header-icon" style="background: rgba(229,57,53,.1)">
              <mat-icon style="color: #e53935">shield</mat-icon>
            </div>
            <div>
              <mat-card-title class="card-title">Seguridad</mat-card-title>
              <mat-card-subtitle class="card-subtitle">Contraseña y opciones de acceso</mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-divider />
          <mat-card-content class="card-body">
            <app-security-section />
          </mat-card-content>
        </mat-card>

        <!-- Preferencias -->
        <mat-card class="settings-card">
          <mat-card-header class="card-header">
            <div class="card-header-icon" style="background: rgba(245,127,23,.1)">
              <mat-icon style="color: #F57F17">tune</mat-icon>
            </div>
            <div>
              <mat-card-title class="card-title">Preferencias</mat-card-title>
              <mat-card-subtitle class="card-subtitle">Tema oscuro y configuración de la interfaz</mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-divider />
          <mat-card-content class="card-body">
            <!-- Dark mode destacado -->
            <div class="dark-mode-banner" [class.is-dark]="themeSvc.isDark()">
              <div class="dm-info">
                <mat-icon class="dm-icon">{{ themeSvc.isDark() ? 'dark_mode' : 'light_mode' }}</mat-icon>
                <div>
                  <p class="dm-title">Modo {{ themeSvc.isDark() ? 'oscuro' : 'claro' }} activado</p>
                  <p class="dm-sub">El tema se aplica a toda la interfaz y se guarda entre sesiones.</p>
                </div>
              </div>
              <button
                class="dm-toggle"
                [class.dm-toggle-dark]="themeSvc.isDark()"
                (click)="themeSvc.toggleDarkMode()"
                type="button"
                [attr.aria-label]="(themeSvc.isDark() ? 'Activar modo claro' : 'Activar modo oscuro')">
                <mat-icon>{{ themeSvc.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
                {{ themeSvc.isDark() ? 'Modo claro' : 'Modo oscuro' }}
              </button>
            </div>
            <mat-divider class="my-5" />
            <app-preferences-section />
          </mat-card-content>
        </mat-card>

        <!-- Sesión activa -->
        <mat-card class="settings-card">
          <mat-card-header class="card-header">
            <div class="card-header-icon" style="background: rgba(33,150,243,.1)">
              <mat-icon style="color: #1976d2">manage_accounts</mat-icon>
            </div>
            <div>
              <mat-card-title class="card-title">Sesión activa</mat-card-title>
              <mat-card-subtitle class="card-subtitle">Información de tu sesión JWT actual</mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-divider />
          <mat-card-content class="card-body">
            <app-session-info />
          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      min-height: 100%;
      background: var(--bg-app);
    }

    .settings-header {
      background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
      padding: 32px 24px;
    }

    .settings-header-inner {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      width: 52px; height: 52px;
      border-radius: 16px;
      background: rgba(255,255,255,.18);
      border: 1px solid rgba(255,255,255,.25);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: white; }
    }

    .settings-title   { font-size: 1.6rem; font-weight: 800; color: white; margin: 0 0 4px; letter-spacing: -.5px; }
    .settings-subtitle { font-size: .9rem; color: rgba(255,255,255,.7); margin: 0; }

    .settings-body {
      max-width: 720px;
      margin: 0 auto;
      padding: 28px 24px 48px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .settings-card {
      border-radius: 16px !important;
      background: var(--bg-surface) !important;
      box-shadow: var(--shadow-card) !important;
      border: 1px solid var(--border-color) !important;
      overflow: hidden;
    }

    .card-header {
      display: flex !important;
      align-items: center !important;
      gap: 14px !important;
      padding: 20px 24px !important;
    }

    .card-header-icon {
      width: 42px; height: 42px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }

    .card-title   { font-size: 1rem !important; font-weight: 700 !important; color: var(--text-primary) !important; margin: 0 !important; }
    .card-subtitle { font-size: .8rem !important; color: var(--text-muted) !important; margin: 2px 0 0 !important; }

    .card-body { padding: 24px 24px 20px !important; }
    .settings-card > mat-divider { border-top-color: var(--border-color) !important; }

    /* Dark mode banner */
    .dark-mode-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 18px;
      border-radius: 12px;
      background: rgba(46,125,50,.07);
      border: 1px solid rgba(46,125,50,.15);
      transition: background .3s, border-color .3s;

      &.is-dark {
        background: rgba(96,173,94,.1);
        border-color: rgba(96,173,94,.25);
      }
    }

    .dm-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dm-icon {
      font-size: 24px; width: 24px; height: 24px;
      color: var(--color-primary);
    }

    .dm-title { font-size: .9rem; font-weight: 600; color: var(--text-primary); margin: 0 0 3px; }
    .dm-sub   { font-size: .78rem; color: var(--text-muted); margin: 0; }

    .dm-toggle {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 8px 16px;
      border-radius: 10px;
      border: 1.5px solid var(--color-primary);
      background: transparent;
      color: var(--color-primary);
      font-size: .82rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: background .2s, color .2s;
      font-family: inherit;

      mat-icon { font-size: 17px; width: 17px; height: 17px; }

      &:hover { background: var(--color-primary); color: white; }

      &.dm-toggle-dark {
        border-color: var(--color-primary-light);
        color: var(--color-primary-light);
        &:hover { background: var(--color-primary-light); color: #0a1a0b; }
      }
    }

    .my-5 { margin: 20px 0 !important; }
  `],
})
export class SettingsComponent {
  readonly themeSvc = inject(ThemeService);
}
