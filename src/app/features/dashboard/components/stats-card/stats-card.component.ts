import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="h-full">
      <mat-card-content class="p-4">
        <div class="flex items-center gap-2 mb-3">
          <mat-icon [class]="colorClass" style="font-size:22px;width:22px;height:22px">{{ icon }}</mat-icon>
          <span class="text-sm text-gray-500 font-medium">{{ label }}</span>
        </div>

        @if (value === null) {
          <div class="h-8 bg-gray-200 rounded animate-pulse w-2/3 mb-2"></div>
          @if (subtitle !== undefined) {
            <div class="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
          }
        } @else {
          <p class="text-3xl font-bold text-gray-800 leading-tight">{{ value }}</p>
          @if (subtitle) {
            <p class="text-xs text-gray-400 mt-1">{{ subtitle }}</p>
          }
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class StatsCardComponent {
  @Input() icon       = '';
  @Input() value: string | number | null = null;
  @Input() label      = '';
  @Input() subtitle?: string;
  @Input() colorClass = 'text-green-700';
}
