import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmDialogComponent, ConfirmDialogData } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-security-section',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="flex flex-col gap-3">
      <p class="text-sm text-gray-600">
        Puedes solicitar un enlace de restablecimiento de contraseña al correo registrado en tu cuenta.
      </p>
      <div>
        <button mat-stroked-button color="primary" (click)="onChangePassword()">
          <mat-icon>lock_reset</mat-icon>
          Cambiar contraseña
        </button>
      </div>
    </div>
  `,
})
export class SecuritySectionComponent {
  private readonly authSvc = inject(AuthService);
  private readonly dialog  = inject(MatDialog);

  onChangePassword(): void {
    const email = this.authSvc.currentUser()?.email ?? '';
    const data: ConfirmDialogData = {
      title:         'Cambiar contraseña',
      message:       `Se enviará un enlace de recuperación a ${email}. ¿Deseas continuar?`,
      confirmLabel:  'Enviar enlace',
      cancelLabel:   'Cancelar',
    };

    this.dialog.open(ConfirmDialogComponent, { data, width: '400px' })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.authSvc.requestRecovery(email).subscribe();
      });
  }
}
