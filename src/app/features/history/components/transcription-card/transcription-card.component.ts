import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { TranscriptionService } from '@core/services/transcription.service';
import type { TranscriptionListItem } from '@core/models/transcription.models';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { RenameDialogComponent } from '@shared/components/rename-dialog/rename-dialog.component';

type DownloadFormat = 'txt' | 'json' | 'srt';

@Component({
  selector: 'app-transcription-card',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule],
  template: `
    <mat-card class="hover:shadow-md transition-shadow cursor-pointer">
      <mat-card-content class="p-4">

        <!-- Cabecera con nombre y fecha -->
        <a [routerLink]="['/app/history', item.transcription_id]"
           class="block no-underline">
          <div class="flex items-start gap-3 mb-3">
            <mat-icon class="text-green-600 mt-0.5" style="flex-shrink:0">audio_file</mat-icon>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800 text-sm truncate">{{ item.audio_filename }}</p>
              <div class="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                <span>{{ formatDuration(item.audio_duration) }}</span>
                <span>·</span>
                <span>{{ relativeTime(item.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Preview del texto -->
          <p class="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3"
             style="font-family:'Noto Sans',sans-serif">
            {{ item.text.slice(0, 120) }}{{ item.text.length > 120 ? '…' : '' }}
          </p>
        </a>

        <mat-divider class="mb-3" />

        <!-- Botones de descarga mini -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs text-gray-400 mr-1">Descargar:</span>
          @for (fmt of formats; track fmt) {
            <button mat-icon-button
                    [attr.aria-label]="'Descargar ' + fmt.toUpperCase()"
                    [title]="fmt.toUpperCase()"
                    (click)="onDownload(fmt)">
              <mat-icon style="font-size:18px;width:18px;height:18px">{{ fmtIcon(fmt) }}</mat-icon>
            </button>
          }

          <span class="flex-1"></span>

          <button mat-icon-button
                  aria-label="Renombrar transcripción"
                  title="Renombrar"
                  (click)="onRenameClick($event)">
            <mat-icon style="font-size:18px;width:18px;height:18px">edit</mat-icon>
          </button>

          <button mat-icon-button
                  aria-label="Eliminar transcripción"
                  title="Eliminar"
                  (click)="onDeleteClick($event)">
            <mat-icon style="font-size:18px;width:18px;height:18px;color:#e53935">delete</mat-icon>
          </button>
        </div>

      </mat-card-content>
    </mat-card>
  `,
})
export class TranscriptionCardComponent {
  private readonly transcriptionSvc = inject(TranscriptionService);
  private readonly snackBar         = inject(MatSnackBar);
  private readonly dialog           = inject(MatDialog);

  @Input({ required: true }) item!: TranscriptionListItem;
  @Output() deleted = new EventEmitter<string>();
  @Output() renamed = new EventEmitter<TranscriptionListItem>();

  readonly formats: DownloadFormat[] = ['txt', 'json', 'srt'];

  fmtIcon(fmt: DownloadFormat): string {
    return { txt: 'description', json: 'data_object', srt: 'subtitles' }[fmt];
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `hace ${days}d`;
    if (hrs > 0)  return `hace ${hrs}h`;
    if (mins > 0) return `hace ${mins}min`;
    return 'hace un momento';
  }

  onDownload(format: DownloadFormat): void {
    this.transcriptionSvc.download(this.item.transcription_id, format).subscribe({
      next: ({ blob, filename }) => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
        this.snackBar.open('Descarga iniciada.', 'OK', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('No se pudo generar el archivo.', 'Cerrar', { duration: 5000 });
      },
    });
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title:        'Eliminar transcripción',
        message:      '¿Estás seguro de que deseas eliminar esta transcripción? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
      },
      width: '360px',
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.transcriptionSvc.delete(this.item.transcription_id).subscribe({
        next: () => {
          this.snackBar.open('Transcripción eliminada.', 'OK', { duration: 3000 });
          this.deleted.emit(this.item.transcription_id);
        },
        error: (err: { status?: number }) => {
          const msg = err?.status === 403
            ? 'No tienes permiso para eliminar esta transcripción.'
            : err?.status === 404
              ? 'La transcripción ya no existe.'
              : 'No se pudo eliminar la transcripción.';
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        },
      });
    });
  }

  onRenameClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const ref = this.dialog.open(RenameDialogComponent, {
      data:  { currentName: this.item.audio_filename },
      width: '400px',
    });

    ref.afterClosed().subscribe((newName: string | null) => {
      if (!newName || newName === this.item.audio_filename) return;
      this.transcriptionSvc.rename(this.item.transcription_id, newName).subscribe({
        next: updated => {
          this.snackBar.open('Transcripción renombrada.', 'OK', { duration: 3000 });
          this.renamed.emit({ ...this.item, audio_filename: updated.audio_filename });
        },
        error: (err: { status?: number }) => {
          const msg = err?.status === 403
            ? 'No tienes permiso para editar esta transcripción.'
            : err?.status === 404
              ? 'La transcripción ya no existe.'
              : err?.status === 422
                ? 'Nombre inválido.'
                : 'No se pudo renombrar la transcripción.';
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        },
      });
    });
  }
}
