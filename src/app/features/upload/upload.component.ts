import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { AudioUploadService } from '@core/services/audio-upload.service';
import type { TranscribeResponse } from '@core/models/transcription.models';
import { AudioDropzoneComponent } from './components/audio-dropzone/audio-dropzone.component';
import { UploadProgressComponent } from './components/upload-progress/upload-progress.component';
import { TranscriptionResultComponent } from './components/transcription-result/transcription-result.component';
import { DownloadButtonsComponent } from './components/download-buttons/download-buttons.component';
import { ErrorBannerComponent } from '@shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    AudioDropzoneComponent,
    UploadProgressComponent,
    TranscriptionResultComponent,
    DownloadButtonsComponent,
    ErrorBannerComponent,
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-800">Transcribir audio</h1>
        <p class="text-gray-500 text-sm mt-1">
          Sube un archivo de audio en quechua y obtén su transcripción en segundos.
        </p>
      </div>

      <!-- IDLE: dropzone — E2-HU01-S01 -->
      @if (isIdle()) {
        <mat-card>
          <mat-card-content class="p-6">
            <app-audio-dropzone
              (fileSelected)="onFileSelected($event)"
              (validationError)="onValidationError($event)" />

            @if (validationMsg) {
              <div class="mt-3 flex items-center gap-2 text-red-600 text-sm">
                <mat-icon style="font-size:18px;width:18px;height:18px">warning</mat-icon>
                {{ validationMsg }}
              </div>
            }
          </mat-card-content>
        </mat-card>
      }

      <!-- UPLOADING: progreso — E2-HU01-S03 -->
      @if (isUploading()) {
        <mat-card>
          <mat-card-content class="p-6">
            <app-upload-progress />
          </mat-card-content>
        </mat-card>
      }

      <!-- SUCCESS: resultado + descarga — E2-HU02-S01/S03, E2-HU06-S01/S02 -->
      @if (isSuccess() && uploadResult()) {
        <div class="flex flex-col gap-4">
          <app-transcription-result
            [result]="uploadResult()!"
            [fileName]="selectedFileName" />

          @if (transcriptionId()) {
            <mat-card>
              <mat-card-content class="p-4">
                <p class="text-sm text-gray-500 mb-3 font-medium">Descargar transcripción</p>
                <app-download-buttons [transcriptionId]="transcriptionId()" />
              </mat-card-content>
            </mat-card>
          }

          <div class="flex justify-center">
            <button mat-stroked-button (click)="reset()">
              <mat-icon>refresh</mat-icon>
              Nueva transcripción
            </button>
          </div>
        </div>
      }

      <!-- ERROR — E2-HU02-S02, E2-HU04-S02/S03 -->
      @if (isError()) {
        <div class="flex flex-col gap-4">
          <app-error-banner
            [message]="errorMsg()"
            retryLabel="Intentar con otro archivo"
            (retry)="reset()" />
        </div>
      }

    </div>
  `,
})
export class UploadComponent {
  private readonly uploadSvc = inject(AudioUploadService);

  // Computed signals del estado del servicio
  readonly isIdle      = computed(() => this.uploadSvc.uploadState() === 'idle');
  readonly isUploading = computed(() => this.uploadSvc.uploadState() === 'uploading');
  readonly isSuccess   = computed(() => this.uploadSvc.uploadState() === 'success');
  readonly isError     = computed(() => this.uploadSvc.uploadState() === 'error');
  readonly uploadResult = computed(() => this.uploadSvc.uploadResult());
  readonly errorMsg    = computed(() => this.uploadSvc.errorMessage());
  readonly transcriptionId = computed(() => this.uploadSvc.uploadResult()?.transcription_id ?? '');

  validationMsg    = '';
  selectedFileName = '';

  onFileSelected(file: File): void {
    this.validationMsg    = '';
    this.selectedFileName = file.name;
    this.uploadSvc.uploadAudio(file);
  }

  onValidationError(msg: string): void {
    this.validationMsg = msg;
  }

  reset(): void {
    this.validationMsg    = '';
    this.selectedFileName = '';
    this.uploadSvc.reset();
  }
}
