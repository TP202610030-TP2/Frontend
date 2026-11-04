import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '@core/services/auth.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-session-info',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="flex flex-col gap-4">

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-xs text-gray-400 uppercase font-semibold mb-0.5">Correo</p>
          <p class="text-gray-800 font-medium">{{ email() }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase font-semibold mb-0.5">Sesión expira</p>
          <p class="text-gray-800 font-medium">{{ expiration() }}</p>
        </div>
      </div>

      <div>
        <button mat-stroked-button color="warn" (click)="onLogout()">
          <mat-icon>logout</mat-icon>
          Cerrar sesión
        </button>
      </div>

    </div>
  `,
})
export class SessionInfoComponent {
  private readonly authSvc = inject(AuthService);
  private readonly dialog  = inject(MatDialog);

  readonly email = computed(() => this.authSvc.currentUser()?.email ?? '');

  readonly expiration = computed(() => {
    const payload = this.authSvc.getTokenPayload();
    if (!payload) return '—';
    return new Date(payload.exp * 1000).toLocaleString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  });

  onLogout(): void {
    const data: ConfirmDialogData = {
      title:        'Cerrar sesión',
      message:      '¿Estás seguro de que deseas cerrar sesión?',
      confirmLabel: 'Cerrar sesión',
    };

    this.dialog.open(ConfirmDialogComponent, { data, width: '360px' })
      .afterClosed()
      .subscribe(confirmed => {
        if (confirmed) this.authSvc.logout().subscribe();
      });
  }
}
