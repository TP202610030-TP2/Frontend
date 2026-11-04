import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

const ALLOWED_EXTENSIONS = ['wav', 'mp3', 'ogg', 'flac', 'm4a'];
const MAX_SIZE_MB         = 50;
const MAX_SIZE_BYTES      = MAX_SIZE_MB * 1024 * 1024;

@Component({
  selector: 'app-audio-dropzone',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="flex flex-col gap-3">
      <div
        class="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200"
        [class.border-green-500]="dragActive"
        [class.bg-green-50]="dragActive"
        [class.border-gray-300]="!dragActive"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="dragActive = false"
        (drop)="onDrop($event)"
        role="button"
        tabindex="0"
        (keydown.enter)="fileInput.click()"
        aria-label="Seleccionar archivo de audio">

        <mat-icon class="text-green-600 mb-3"
                  style="font-size:52px;width:52px;height:52px;display:block;margin:0 auto">
          {{ dragActive ? 'file_download' : selectedFile ? 'audio_file' : 'cloud_upload' }}
        </mat-icon>

        @if (dragActive) {
          <p class="text-green-700 font-semibold text-lg">Suelta el archivo aquí</p>
        } @else if (selectedFile) {
          <p class="font-semibold text-gray-800">{{ selectedFile.name }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ formatSize(selectedFile.size) }}</p>
          <button mat-stroked-button class="mt-3 text-sm" (click)="$event.stopPropagation(); clear()">
            Cambiar archivo
          </button>
        } @else {
          <p class="text-gray-700 font-medium text-lg">Arrastra tu archivo de audio aquí</p>
          <p class="text-gray-400 text-sm mt-1">o haz clic para seleccionar</p>
          <p class="text-xs text-gray-400 mt-4">
            WAV · MP3 · OGG · FLAC · M4A &nbsp;·&nbsp; máx. {{ maxSizeMb }} MB
          </p>
        }

        <input #fileInput type="file" class="hidden"
               accept=".wav,.mp3,.ogg,.flac,.m4a"
               (change)="onFileInputChange($event)">
      </div>

      @if (errorText) {
        <div class="flex items-center gap-2 text-red-600 text-sm px-1" role="alert">
          <mat-icon style="font-size:18px;width:18px;height:18px;flex-shrink:0">error</mat-icon>
          {{ errorText }}
        </div>
      }
    </div>
  `,
})
export class AudioDropzoneComponent {
  @Output() fileSelected    = new EventEmitter<File>();
  @Output() validationError = new EventEmitter<string>();
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  dragActive   = false;
  selectedFile: File | null = null;
  errorText    = '';
  readonly maxSizeMb = MAX_SIZE_MB;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileInputChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.handleFile(file);
  }

  handleFile(file: File): void {
    const error = this.validate(file);
    if (error) {
      this.errorText = error;
      this.validationError.emit(error);
    } else {
      this.errorText   = '';
      this.selectedFile = file;
      this.fileSelected.emit(file);
    }
  }

  clear(): void {
    this.selectedFile = null;
    this.errorText    = '';
    if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
  }

  formatSize(bytes: number): string {
    return bytes >= 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(0)} KB`;
  }

  private validate(file: File): string | null {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Formato no soportado. Usa: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `El archivo supera el límite de ${MAX_SIZE_MB} MB permitido.`;
    }
    return null;
  }
}
