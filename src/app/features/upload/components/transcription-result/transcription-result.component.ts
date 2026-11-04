import { Component, inject, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { TranscribeResponse } from '@core/models/transcription.models';

@Component({
  selector: 'app-transcription-result',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <mat-card>
      <mat-card-header class="mb-2">
        <mat-icon mat-card-avatar class="text-green-600">check_circle</mat-icon>
        <mat-card-title>Transcripción completada</mat-card-title>
        <mat-card-subtitle>{{ fileName }}</mat-card-subtitle>
      </mat-card-header>

      <mat-divider />

      <!-- Metadatos -->
      <mat-card-content class="pt-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-400 mb-1">Duración</p>
            <p class="font-semibold text-gray-800 text-sm">{{ formatDuration(result.metadata.duration) }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-400 mb-1">Formato</p>
            <p class="font-semibold text-gray-800 text-sm uppercase">{{ result.metadata.format }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-400 mb-1">ID</p>
            <p class="font-semibold text-gray-800 text-sm font-mono truncate">
              {{ result.transcription_id ?? 'N/A' }}
            </p>
          </div>
        </div>

        <!-- Texto transcrito — E2-HU02-S03 -->
        <p class="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Texto transcrito</p>
        <textarea
          readonly
          [value]="result.transcription_text ?? '(sin texto)'"
          class="w-full border border-gray-200 rounded-lg p-4 text-gray-800 resize-none bg-gray-50 focus:outline-none"
          style="font-family:'Noto Sans',sans-serif;font-size:16px;min-height:150px"
          aria-label="Texto transcrito">
        </textarea>

        <div class="flex justify-end mt-3">
          <button mat-stroked-button color="primary" (click)="copyText()">
            <mat-icon>content_copy</mat-icon>
            Copiar texto
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
})
export class TranscriptionResultComponent {
  private readonly snackBar = inject(MatSnackBar);

  @Input() result!: TranscribeResponse;
  @Input() fileName = 'archivo de audio';

  copyText(): void {
    const text = this.result?.transcription_text ?? '';
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Texto copiado al portapapeles.', 'OK', { duration: 3000 });
    });
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }
}
