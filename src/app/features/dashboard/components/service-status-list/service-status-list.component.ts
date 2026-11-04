import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServiceStatusMap } from '@core/models/dashboard.models';

const SERVICE_LABELS: Record<keyof ServiceStatusMap, string> = {
  'auth':                  'Servicio de autenticación',
  'audio-processor':       'Procesador de audio',
  'asr':                   'Servicio ASR (Whisper)',
  'transcription-manager': 'Gestor de transcripciones',
};

const SERVICE_ORDER: ReadonlyArray<keyof ServiceStatusMap> = [
  'auth',
  'audio-processor',
  'asr',
  'transcription-manager',
];

@Component({
  selector: 'app-service-status-list',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <div class="flex flex-col gap-2">
      @for (key of serviceOrder; track key) {
        @let status = services ? services[key] : null;
        <div class="flex items-center justify-between p-3 rounded-lg" style="background:var(--bg-surface-2)">
          <div class="flex items-center gap-2">
            @if (status === null) {
              <div class="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
            } @else {
              <mat-icon
                [class]="status === 'healthy' ? 'text-green-600' : 'text-red-500'"
                style="font-size:20px;width:20px;height:20px">
                {{ status === 'healthy' ? 'check_circle' : 'error' }}
              </mat-icon>
            }
            <span class="text-sm" style="color:var(--text-primary)">{{ serviceLabels[key] }}</span>
          </div>

          @if (status === null) {
            <div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          } @else {
            <span
              class="text-xs font-semibold px-2 py-0.5 rounded-full"
              [class]="status === 'healthy'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'"
              [matTooltip]="status === 'unavailable' ? 'Servicio no disponible' : ''">
              {{ status === 'healthy' ? 'Operativo' : 'No disponible' }}
            </span>
          }
        </div>
      }
    </div>
  `,
})
export class ServiceStatusListComponent {
  @Input() services: ServiceStatusMap | null = null;
  readonly serviceOrder  = SERVICE_ORDER;
  readonly serviceLabels = SERVICE_LABELS;
}
