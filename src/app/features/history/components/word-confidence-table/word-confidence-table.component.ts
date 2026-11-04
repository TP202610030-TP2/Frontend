import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { WordConfidence } from '@core/models/transcription.models';

@Component({
  selector: 'app-word-confidence-table',
  standalone: true,
  imports: [NgClass, MatTableModule, MatProgressBarModule, MatButtonModule, MatIconModule],
  template: `
    <div class="flex flex-col gap-3">

      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-gray-600">Confianza por palabra</p>
        <button mat-stroked-button class="text-xs h-8" (click)="toggleSort()">
          <mat-icon style="font-size:16px;width:16px;height:16px">sort</mat-icon>
          {{ sortAsc ? 'Mayor confianza primero' : 'Menor confianza primero' }}
        </button>
      </div>

      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table mat-table [dataSource]="sortedWords" class="w-full">

          <!-- Palabra -->
          <ng-container matColumnDef="word">
            <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase">
              Palabra
            </th>
            <td mat-cell *matCellDef="let row" class="font-medium text-gray-800"
                style="font-family:'Noto Sans',sans-serif">
              {{ row.word }}
            </td>
          </ng-container>

          <!-- Confianza -->
          <ng-container matColumnDef="confidence">
            <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase">
              Confianza
            </th>
            <td mat-cell *matCellDef="let row">
              <div class="flex items-center gap-2 min-w-32">
                <mat-progress-bar
                  mode="determinate"
                  [value]="row.confidence * 100"
                  [color]="row.confidence >= 0.8 ? 'primary' : row.confidence >= 0.5 ? 'accent' : 'warn'"
                  class="flex-1" />
                <span class="text-xs text-gray-600 w-10 text-right">
                  {{ (row.confidence * 100).toFixed(0) }}%
                </span>
              </div>
            </td>
          </ng-container>

          <!-- Posición -->
          <ng-container matColumnDef="position">
            <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase">
              Posición
            </th>
            <td mat-cell *matCellDef="let row" class="text-gray-500 text-sm">
              {{ row.start_time.toFixed(1) }}s
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"
              [ngClass]="rowClass(row.confidence)"></tr>
        </table>
      </div>

      <!-- Leyenda -->
      <div class="flex flex-wrap gap-4 text-xs text-gray-500 px-1">
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded bg-green-400 inline-block"></span> Alta (&ge;80%)
        </span>
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded bg-yellow-400 inline-block"></span> Media (50–79%)
        </span>
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded bg-red-400 inline-block"></span> Baja (&lt;50%)
        </span>
      </div>

    </div>
  `,
  styles: [`
    .row-high  td { background: rgba(76,175,80,0.08); }
    .row-mid   td { background: rgba(255,193,7,0.10); }
    .row-low   td { background: rgba(244,67,54,0.08); }
  `],
})
export class WordConfidenceTableComponent {
  @Input() words: WordConfidence[] = [];

  readonly columns = ['word', 'confidence', 'position'];
  sortAsc = false;

  get sortedWords(): WordConfidence[] {
    return [...this.words].sort((a, b) =>
      this.sortAsc ? a.confidence - b.confidence : b.confidence - a.confidence
    );
  }

  toggleSort(): void { this.sortAsc = !this.sortAsc; }

  rowClass(confidence: number): string {
    if (confidence >= 0.8) return 'row-high';
    if (confidence >= 0.5) return 'row-mid';
    return 'row-low';
  }
}
