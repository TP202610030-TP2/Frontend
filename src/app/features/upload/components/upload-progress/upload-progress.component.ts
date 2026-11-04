import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

const MESSAGES = [
  'Enviando archivo al servidor ASR…',
  'Analizando el audio…',
  'Aplicando modelo de reconocimiento de voz…',
  'Generando la transcripción en quechua…',
  'Finalizando proceso…',
];

@Component({
  selector: 'app-upload-progress',
  standalone: true,
  imports: [MatProgressBarModule, MatIconModule],
  template: `
    <div class="flex flex-col items-center gap-6 py-8 px-4 text-center">
      <mat-icon class="text-green-600" style="font-size:56px;width:56px;height:56px">
        graphic_eq
      </mat-icon>

      <div class="w-full max-w-sm">
        <mat-progress-bar mode="indeterminate" color="primary" />
      </div>

      <div>
        <p class="text-gray-700 font-medium">{{ currentMessage() }}</p>
        <p class="text-gray-400 text-sm mt-1">{{ elapsed() }}s transcurridos</p>
      </div>

      <p class="text-xs text-gray-400 max-w-xs">
        El procesamiento puede tomar hasta 5 minutos dependiendo del tamaño y calidad del audio.
      </p>
    </div>
  `,
})
export class UploadProgressComponent implements OnInit, OnDestroy {
  elapsed        = signal(0);
  currentMessage = signal(MESSAGES[0]);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.elapsed.update(e => e + 1);
      const idx = Math.floor(this.elapsed() / 8) % MESSAGES.length;
      this.currentMessage.set(MESSAGES[idx]);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) clearInterval(this.intervalId);
  }
}
