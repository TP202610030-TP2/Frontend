import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <mat-icon class="text-gray-300" style="font-size:72px;width:72px;height:72px">
        {{ icon }}
      </mat-icon>
      <p class="text-gray-600 font-medium text-lg">{{ message }}</p>
      @if (actionLabel && actionRoute) {
        <a mat-raised-button color="primary" [routerLink]="actionRoute">
          {{ actionLabel }}
        </a>
      }
      @if (actionLabel && !actionRoute) {
        <button mat-raised-button color="primary" (click)="action.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon        = 'inbox';
  @Input() message     = 'No hay elementos.';
  @Input() actionLabel?: string;
  @Input() actionRoute?: string;
  @Output() action = new EventEmitter<void>();
}
