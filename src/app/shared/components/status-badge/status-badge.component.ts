import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export type BadgeStatus = 'healthy' | 'unhealthy' | 'unknown';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      [class]="badgeClass"
      [attr.aria-label]="label + ': ' + statusLabel">
      <mat-icon style="font-size:14px;width:14px;height:14px">{{ icon }}</mat-icon>
      {{ label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: BadgeStatus;
  @Input({ required: true }) label!: string;

  get badgeClass(): string {
    return {
      healthy:   'bg-green-100 text-green-800',
      unhealthy: 'bg-red-100 text-red-800',
      unknown:   'bg-gray-100 text-gray-600',
    }[this.status] ?? 'bg-gray-100 text-gray-600';
  }

  get icon(): string {
    return { healthy: 'check_circle', unhealthy: 'error', unknown: 'help' }[this.status] ?? 'help';
  }

  get statusLabel(): string {
    return { healthy: 'activo', unhealthy: 'no disponible', unknown: 'desconocido' }[this.status] ?? 'desconocido';
  }
}
