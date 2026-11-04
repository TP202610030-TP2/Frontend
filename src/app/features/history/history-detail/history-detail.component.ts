import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { TranscriptionService } from '@core/services/transcription.service';
import type { TranscriptionDetail } from '@core/models/transcription.models';
import { WordConfidenceTableComponent } from '../components/word-confidence-table/word-confidence-table.component';
import { ErrorBannerComponent } from '@shared/components/error-banner/error-banner.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { RenameDialogComponent } from '@shared/components/rename-dialog/rename-dialog.component';

type DownloadFormat = 'txt' | 'json' | 'srt';

@Component({
  selector: 'app-history-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatDividerModule,
    WordConfidenceTableComponent,
    ErrorBannerComponent,
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <a routerLink="/app/history" class="hover:text-green-700 transition-colors">Historial</a>
        <mat-icon style="font-size:16px;width:16px;height:16px">chevron_right</mat-icon>
        <span class="text-gray-600">Detalle</span>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="48" />
        </div>
      }

      <!-- Error 403 -->
      @if (!loading() && errorCode() === 403) {
        <app-error-banner message="No tienes acceso a esta transcripción." />
      }

      <!-- Error 404 -->
      @if (!loading() && errorCode() === 404) {
        <app-error-banner message="Transcripción no encontrada." />
      }

      <!-- Error genérico -->
      @if (!loading() && errorCode() !== null && errorCode() !== 403 && errorCode() !== 404) {
        <app-error-banner
          message="No se pudo cargar la transcripción."
          retryLabel="Reintentar"
          (retry)="load()" />
      }

      <!-- Contenido -->
      @if (!loading() && detail()) {
        <mat-card class="mb-6">
          <mat-card-content class="p-5">

            <!-- Cabecera -->
            <div class="flex items-start gap-3 mb-4">
              <mat-icon class="text-green-600 mt-0.5" style="flex-shrink:0">audio_file</mat-icon>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h1 class="text-lg font-semibold text-gray-800 truncate">{{ detail()!.audio_filename }}</h1>
                  <button mat-icon-button aria-label="Renombrar transcripción" title="Renombrar" (click)="onRenameClick()">
                    <mat-icon style="font-size:18px;width:18px;height:18px">edit</mat-icon>
                  </button>
                </div>
                <div class="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span>{{ formatDuration(detail()!.audio_duration) }}</span>
                  <span>·</span>
                  <span>{{ formatDate(detail()!.created_at) }}</span>
                  @if (detail()!.processing_time) {
                    <span>· procesado en {{ detail()!.processing_time.toFixed(1) }}s</span>
                  }
                </div>
              </div>
            </div>

            <!-- Texto completo -->
            <textarea
              readonly
              class="w-full border border-gray-200 rounded-lg p-3 text-gray-700 resize-none leading-relaxed bg-gray-50"
              style="font-family:'Noto Sans',sans-serif;font-size:15px;min-height:180px"
              [value]="detail()!.text"></textarea>

            <mat-divider class="my-4" />

            <!-- Descargas -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm text-gray-500 mr-1">Descargar:</span>
              @for (fmt of formats; track fmt) {
                <button mat-stroked-button (click)="onDownload(fmt)">
                  <mat-icon>{{ fmtIcon(fmt) }}</mat-icon>
                  {{ fmt.toUpperCase() }}
                </button>
              }

              <span class="flex-1"></span>

              <button mat-stroked-button color="warn" (click)="onDeleteClick()">
                <mat-icon>delete</mat-icon>
                Eliminar
              </button>
            </div>

          </mat-card-content>
        </mat-card>

        <!-- Tabla de confianza -->
        @if (detail()!.confidence_scores.length > 0) {
          <mat-card>
            <mat-card-content class="p-5">
              <app-word-confidence-table [words]="detail()!.confidence_scores" />
            </mat-card-content>
          </mat-card>
        }
      }

    </div>
  `,
})
export class HistoryDetailComponent implements OnInit {
  private readonly route            = inject(ActivatedRoute);
  private readonly router           = inject(Router);
  private readonly transcriptionSvc = inject(TranscriptionService);
  private readonly snackBar         = inject(MatSnackBar);
  private readonly dialog           = inject(MatDialog);

  readonly detail    = signal<TranscriptionDetail | null>(null);
  readonly loading   = signal(true);
  readonly errorCode = signal<number | null>(null);

  readonly formats: DownloadFormat[] = ['txt', 'json', 'srt'];

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.errorCode.set(404); this.loading.set(false); return; }

    this.loading.set(true);
    this.errorCode.set(null);
    this.transcriptionSvc.getDetail(id).subscribe({
      next: d => { this.detail.set(d); this.loading.set(false); },
      error: (err: { status?: number }) => {
        this.errorCode.set(err?.status ?? 500);
        this.loading.set(false);
      },
    });
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  fmtIcon(fmt: DownloadFormat): string {
    return { txt: 'description', json: 'data_object', srt: 'subtitles' }[fmt];
  }

  onDownload(format: DownloadFormat): void {
    const id = this.detail()?.transcription_id;
    if (!id) return;
    this.transcriptionSvc.download(id, format).subscribe({
      next: ({ blob, filename }) => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      },
    });
  }

  onDeleteClick(): void {
    const id = this.detail()?.transcription_id;
    if (!id) return;

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
      this.transcriptionSvc.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Transcripción eliminada.', 'OK', { duration: 3000 });
          this.router.navigate(['/app/history']);
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

  onRenameClick(): void {
    const current = this.detail();
    if (!current) return;

    const ref = this.dialog.open(RenameDialogComponent, {
      data:  { currentName: current.audio_filename },
      width: '400px',
    });

    ref.afterClosed().subscribe((newName: string | null) => {
      if (!newName || newName === current.audio_filename) return;
      this.transcriptionSvc.rename(current.transcription_id, newName).subscribe({
        next: updated => {
          this.detail.set(updated);
          this.snackBar.open('Transcripción renombrada.', 'OK', { duration: 3000 });
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
