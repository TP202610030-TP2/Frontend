import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AudioUploadService } from '@core/services/audio-upload.service';

type DownloadFormat = 'txt' | 'json' | 'srt';

const FORMAT_ICONS: Record<DownloadFormat, string> = {
  txt:  'description',
  json: 'data_object',
  srt:  'subtitles',
};

@Component({
  selector: 'app-download-buttons',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="flex flex-wrap gap-3">
      @for (fmt of formats; track fmt) {
        <button mat-stroked-button
                [disabled]="!transcriptionId"
                (click)="onDownload(fmt)">
          <mat-icon>{{ icons[fmt] }}</mat-icon>
          Descargar {{ fmt.toUpperCase() }}
        </button>
      }
    </div>
  `,
})
export class DownloadButtonsComponent {
  private readonly uploadSvc = inject(AudioUploadService);
  private readonly snackBar  = inject(MatSnackBar);

  @Input() transcriptionId = '';

  readonly formats: DownloadFormat[] = ['txt', 'json', 'srt'];
  readonly icons = FORMAT_ICONS;

  onDownload(format: DownloadFormat): void {
    if (!this.transcriptionId) return;
    this.uploadSvc.download(this.transcriptionId, format).subscribe({
      next: ({ blob, filename }) => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.snackBar.open('Descarga iniciada.', 'OK', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('No se pudo generar el archivo.', 'Cerrar', { duration: 5000 });
      },
    });
  }
}
