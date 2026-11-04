import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3" role="alert">
      <mat-icon class="text-red-500" style="flex-shrink:0;margin-top:2px">error_outline</mat-icon>
      <div class="flex-1">
        <p class="text-red-800 text-sm font-medium">{{ message }}</p>
        @if (retryLabel) {
          <button mat-stroked-button color="warn" class="mt-3 text-sm" (click)="retry.emit()">
            <mat-icon>refresh</mat-icon>
            {{ retryLabel }}
          </button>
        }
      </div>
    </div>
  `,
})
export class ErrorBannerComponent {
  @Input() message    = 'Ha ocurrido un error.';
  @Input() retryLabel?: string;
  @Output() retry = new EventEmitter<void>();
}
