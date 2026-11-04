import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-transcript-panel',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="min-h-36 border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col gap-2">

      @if (status === 'idle') {
        <div class="flex flex-col items-center justify-center h-full text-gray-400 gap-2 py-4">
          <mat-icon style="font-size:32px;width:32px;height:32px">graphic_eq</mat-icon>
          <p class="text-sm">La transcripción aparecerá aquí mientras hablas.</p>
        </div>
      }

      @if (status === 'connecting') {
        <p class="text-gray-400 text-sm text-center py-4 animate-pulse">Conectando al servidor…</p>
      }

      @if (finalText) {
        <p class="text-gray-800 font-medium leading-relaxed"
           style="font-family:'Noto Sans',sans-serif;font-size:15px">
          {{ finalText }}
        </p>
      }

      @if (partialText && (status === 'live' || status === 'processing')) {
        <p class="text-gray-400 italic text-sm leading-relaxed">{{ partialText }}</p>
      }

      @if (!finalText && !partialText && (status === 'live')) {
        <p class="text-gray-400 text-sm animate-pulse text-center py-2">Escuchando…</p>
      }

    </div>
  `,
})
export class TranscriptPanelComponent {
  @Input() partialText = '';
  @Input() finalText   = '';
  @Input() status      = 'idle';
}
