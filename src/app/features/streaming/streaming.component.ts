import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StreamingService } from '@core/services/streaming.service';
import { AuthService } from '@core/services/auth.service';
import type { TranscribeResponse } from '@core/models/transcription.models';
import { WaveformCanvasComponent } from './components/waveform-canvas/waveform-canvas.component';
import { TranscriptPanelComponent } from './components/transcript-panel/transcript-panel.component';
import { StreamControlsComponent } from './components/stream-controls/stream-controls.component';
import { TranscriptionResultComponent } from '../upload/components/transcription-result/transcription-result.component';
import { DownloadButtonsComponent } from '../upload/components/download-buttons/download-buttons.component';
import { ErrorBannerComponent } from '@shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-streaming',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    WaveformCanvasComponent,
    TranscriptPanelComponent,
    StreamControlsComponent,
    TranscriptionResultComponent,
    DownloadButtonsComponent,
    ErrorBannerComponent,
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-800">Streaming en vivo</h1>
        <p class="text-gray-500 text-sm mt-1">
          Transcripción de voz quechua en tiempo real mediante WebSocket.
        </p>
      </div>

      <!-- Navegador incompatible — E2-HU03-S01 -->
      @if (unsupportedBrowser) {
        <app-error-banner
          message="Tu navegador no soporta grabación de audio. Usa Chrome 120+ o Firefox 121+." />
      }

      @if (!unsupportedBrowser) {

        <!-- DONE: resultado final — E2-HU03-S03 -->
        @if (isDone() && streamResult()) {
          <div class="flex flex-col gap-4">
            <app-transcription-result
              [result]="streamResult()!"
              fileName="Grabación en vivo" />

            @if (streamSvc.finalTranscriptionId()) {
              <mat-card>
                <mat-card-content class="p-4">
                  <p class="text-sm text-gray-500 mb-3 font-medium">Descargar transcripción</p>
                  <app-download-buttons [transcriptionId]="streamSvc.finalTranscriptionId()!" />
                </mat-card-content>
              </mat-card>
            }

            <div class="flex justify-center">
              <button mat-stroked-button (click)="newRecording()">
                <mat-icon>refresh</mat-icon>
                Nueva grabación
              </button>
            </div>
          </div>
        }

        <!-- ACTIVE: grabación en curso / idle -->
        @if (!isDone()) {
          <mat-card>
            <mat-card-content class="p-6 flex flex-col gap-5">

              <!-- Waveform — solo visible en estado live -->
              @if (isLive()) {
                <app-waveform-canvas [mediaStream]="null" />
              }

              <!-- Panel de transcripción — E2-HU03-S02 -->
              <app-transcript-panel
                [partialText]="streamSvc.partialText()"
                [finalText]="streamSvc.finalText()"
                [status]="streamSvc.status()" />

              <!-- Controles — E2-HU03-S01 -->
              <app-stream-controls
                [status]="streamSvc.status()"
                (startRecording)="onStart()"
                (stopRecording)="onStop()" />

              <!-- Error no-expiración -->
              @if (isError() && !isSessionExpired()) {
                <app-error-banner [message]="streamSvc.errorMessage()" />
              }

            </mat-card-content>
          </mat-card>
        }

      }

    </div>
  `,
})
export class StreamingComponent implements OnInit, OnDestroy {
  readonly streamSvc = inject(StreamingService);
  private readonly authSvc  = inject(AuthService);
  private readonly router   = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  unsupportedBrowser = false;

  private recordingStartedAt: number | null = null;
  readonly recordingDuration = signal(0);

  readonly isLive       = computed(() => this.streamSvc.status() === 'live');
  readonly isError      = computed(() => this.streamSvc.status() === 'error');
  readonly isDone       = computed(() => this.streamSvc.status() === 'done');
  readonly isSessionExpired = computed(() =>
    this.streamSvc.errorMessage().includes('Sesión expirada')
  );

  readonly streamResult = computed<TranscribeResponse | null>(() => {
    const text = this.streamSvc.finalText();
    const id   = this.streamSvc.finalTranscriptionId();
    if (!text && !id) return null;
    return {
      audio_id:           '',
      processed_path:     '',
      metadata:           { format: 'streaming', duration: this.recordingDuration(), sampleRate: 16000, bitRate: 0, channels: 1, codec: null },
      transcription_id:   id,
      transcription_text: text,
    };
  });

  constructor() {
    // Redirige a login si el token expira durante la sesión — E1-HU05-S02
    effect(() => {
      if (this.isSessionExpired() && this.isError()) {
        this.snackBar.open(this.streamSvc.errorMessage(), 'OK', { duration: 5000 });
        this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnInit(): void {
    this.unsupportedBrowser = typeof AudioContext === 'undefined';
  }

  ngOnDestroy(): void {
    this.streamSvc.cleanup();
  }

  onStart(): void {
    const token = this.authSvc.getToken();
    if (token) {
      this.recordingStartedAt = Date.now();
      this.streamSvc.start(token);
    }
  }

  onStop(): void {
    if (this.recordingStartedAt !== null) {
      this.recordingDuration.set(Math.round((Date.now() - this.recordingStartedAt) / 1000));
      this.recordingStartedAt = null;
    }
    this.streamSvc.stop();
  }

  newRecording(): void {
    this.recordingDuration.set(0);
    this.recordingStartedAt = null;
    this.streamSvc.reset();
  }
}
