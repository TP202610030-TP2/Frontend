import { Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';

import { TranscriptionService } from '@core/services/transcription.service';
import type { TranscriptionListItem, PaginationMeta } from '@core/models/transcription.models';
import { TranscriptionCardComponent } from '../components/transcription-card/transcription-card.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '@shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-history-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatIconModule, MatButtonModule, MatPaginatorModule,
    TranscriptionCardComponent,
    EmptyStateComponent,
    ErrorBannerComponent,
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-800">Historial de transcripciones</h1>
        <a mat-raised-button color="primary" routerLink="/app/upload">
          <mat-icon>add</mat-icon> Nueva transcripción
        </a>
      </div>

      <!-- Error -->
      @if (hasError()) {
        <app-error-banner
          message="No se pudo cargar el historial."
          retryLabel="Reintentar"
          (retry)="load(pagination().current_page)" />
      }

      <!-- Skeletons -->
      @if (loading() && !hasError()) {
        <div class="flex flex-col gap-4">
          @for (_ of skeletons; track $index) {
            <div class="animate-pulse bg-white rounded-xl border border-gray-200 p-4 h-32"></div>
          }
        </div>
      }

      <!-- Lista -->
      @if (!loading() && !hasError()) {
        @if (items().length === 0) {
          <app-empty-state
            icon="history"
            message="Aún no tienes transcripciones. ¡Comienza subiendo un audio!"
            actionLabel="Subir audio"
            actionRoute="/app/upload" />
        } @else {
          <div class="flex flex-col gap-4">
            @for (item of items(); track item.transcription_id) {
              <app-transcription-card [item]="item" (deleted)="onDeleted($event)" (renamed)="onRenamed($event)" />
            }
          </div>

          <mat-paginator
            class="mt-6 rounded-lg border border-gray-200 bg-white"
            [length]="pagination().total_items"
            [pageSize]="pagination().page_size"
            [pageIndex]="pagination().current_page - 1"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)" />
        }
      }

    </div>
  `,
})
export class HistoryListComponent implements OnInit {
  private readonly transcriptionSvc = inject(TranscriptionService);

  readonly items      = signal<TranscriptionListItem[]>([]);
  readonly pagination = signal<PaginationMeta>({ current_page: 1, page_size: 10, total_pages: 1, total_items: 0 });
  readonly loading    = signal(true);
  readonly hasError   = signal(false);

  readonly skeletons = Array(5);

  ngOnInit(): void { this.load(1); }

  load(page: number): void {
    this.loading.set(true);
    this.hasError.set(false);
    const size = this.pagination().page_size;
    this.transcriptionSvc.getList(page, size).subscribe({
      next: res => {
        this.items.set(res.transcriptions);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.loading.set(false);
      },
    });
  }

  onPage(event: PageEvent): void {
    this.pagination.update(p => ({ ...p, page_size: event.pageSize }));
    this.load(event.pageIndex + 1);
  }

  onDeleted(transcriptionId: string): void {
    this.items.update(items => items.filter(i => i.transcription_id !== transcriptionId));
    this.pagination.update(p => ({ ...p, total_items: Math.max(0, p.total_items - 1) }));

    // Si la página quedó vacía y no es la primera, retrocede una página
    if (this.items().length === 0 && this.pagination().current_page > 1) {
      this.load(this.pagination().current_page - 1);
    }
  }

  onRenamed(updated: TranscriptionListItem): void {
    this.items.update(items =>
      items.map(i => i.transcription_id === updated.transcription_id ? updated : i),
    );
  }
}
