import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, signal, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-stream-controls',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="flex items-center gap-4 flex-wrap">

      <!-- IDLE / ERROR: botón iniciar -->
      @if (status === 'idle' || status === 'error') {
        <button mat-raised-button color="primary"
                class="h-12 px-6 flex items-center gap-2"
                (click)="startRecording.emit()">
          <mat-icon>mic</mat-icon>
          Iniciar grabación
        </button>
      }

      <!-- CONNECTING: spinner -->
      @if (status === 'connecting') {
        <div class="flex items-center gap-3 text-gray-600">
          <mat-spinner diameter="24"></mat-spinner>
          <span class="text-sm">Conectando al servidor…</span>
        </div>
      }

      <!-- LIVE: badge + timer + stop -->
      @if (status === 'live') {
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2">
            <span class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            <span class="text-red-600 font-bold text-sm tracking-wide">EN VIVO</span>
            <span class="font-mono text-gray-700 text-sm ml-1">{{ formatTime(elapsed()) }}</span>
          </div>
          <button mat-raised-button color="warn"
                  class="h-12 px-6 flex items-center gap-2"
                  (click)="stopRecording.emit()">
            <mat-icon>stop</mat-icon>
            Detener
          </button>
        </div>
      }

      <!-- PROCESSING: spinner -->
      @if (status === 'processing') {
        <div class="flex items-center gap-3 text-gray-600">
          <mat-spinner diameter="24"></mat-spinner>
          <span class="text-sm">Procesando transcripción…</span>
        </div>
      }

    </div>
  `,
})
export class StreamControlsComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) status!: string;
  @Output() startRecording = new EventEmitter<void>();
  @Output() stopRecording  = new EventEmitter<void>();

  elapsed = signal(0);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['status']) return;
    if (this.status === 'live') {
      this.startTimer();
    } else {
      this.stopTimer();
      if (this.status === 'idle') this.elapsed.set(0);
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  private startTimer(): void {
    this.stopTimer();
    this.intervalId = setInterval(() => this.elapsed.update(e => e + 1), 1000);
  }

  private stopTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
