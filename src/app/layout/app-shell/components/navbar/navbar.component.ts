import { Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <mat-toolbar class="navbar">
      <!-- Hamburger -->
      <button mat-icon-button (click)="menuToggle.emit()" aria-label="Abrir menú lateral">
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Logo texto -->
      <span class="navbar-title hidden sm:block">ASR Quechua</span>

      <span class="flex-1"></span>

      <!-- Dark mode toggle -->
      <button
        mat-icon-button
        (click)="themeSvc.toggleDarkMode()"
        [matTooltip]="themeSvc.isDark() ? 'Modo claro' : 'Modo oscuro'"
        class="theme-btn"
        aria-label="Cambiar tema">
        <mat-icon>{{ themeSvc.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <!-- Avatar / menú usuario -->
      <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
        <div class="avatar">{{ initials() }}</div>
        <span class="hidden sm:inline user-name">{{ userName || userEmail }}</span>
        <mat-icon class="chevron">arrow_drop_down</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu" xPosition="before" class="user-menu">
        <div class="menu-header">
          <div class="menu-avatar">{{ initials() }}</div>
          <div>
            <p class="menu-name">{{ userName }}</p>
            <p class="menu-email">{{ userEmail }}</p>
          </div>
        </div>
        <mat-divider />
        <a mat-menu-item routerLink="/app/settings">
          <mat-icon>manage_accounts</mat-icon>
          <span>Configuración</span>
        </a>
        <mat-divider />
        <button mat-menu-item (click)="onLogoutClick()" class="logout-item">
          <mat-icon>logout</mat-icon>
          <span>Cerrar sesión</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: var(--color-primary);
      color: white;
      min-height: 56px;
      padding: 0 8px;
      box-shadow: 0 2px 12px rgba(0,0,0,.18);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .navbar-title {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -.2px;
      margin-left: 4px;
      opacity: .95;
    }

    .theme-btn {
      color: rgba(255,255,255,.85);
      &:hover { color: white; background: rgba(255,255,255,.12); }
    }

    .user-btn {
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 10px;
      padding: 4px 10px;
      min-width: unset;
      &:hover { background: rgba(255,255,255,.12); }
    }

    .avatar, .menu-avatar {
      width: 30px; height: 30px;
      border-radius: 50%;
      background: rgba(255,255,255,.22);
      border: 1.5px solid rgba(255,255,255,.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .75rem;
      font-weight: 700;
      color: white;
      letter-spacing: .5px;
      flex-shrink: 0;
    }

    .menu-avatar {
      width: 36px; height: 36px;
      background: var(--color-primary);
      border: none;
      font-size: .85rem;
      color: white;
    }

    .user-name { font-size: .88rem; font-weight: 500; }
    .chevron   { font-size: 18px; opacity: .7; }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
    }

    .menu-name  { font-weight: 600; font-size: .88rem; color: var(--text-primary); margin: 0 0 2px; }
    .menu-email { font-size: .76rem; color: var(--text-muted); margin: 0; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .logout-item mat-icon { color: #e53935; }
  `],
})
export class NavbarComponent {
  readonly themeSvc = inject(ThemeService);

  private readonly dialog  = inject(MatDialog);
  private readonly authSvc = inject(AuthService);

  @Input() userName  = '';
  @Input() userEmail = '';
  @Output() menuToggle = new EventEmitter<void>();

  initials = computed(() => {
    const name = this.userName || this.userEmail;
    return name
      .split(/[\s@]/)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
  });

  onLogoutClick(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data:  { title: 'Cerrar sesión', message: '¿Estás seguro de que deseas cerrar sesión?', confirmLabel: 'Cerrar sesión' },
      width: '360px',
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) this.authSvc.logout().subscribe();
    });
  }
}
