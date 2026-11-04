import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="grid grid-cols-1 gap-3">
      <a mat-raised-button color="primary" routerLink="/app/upload"
         class="flex items-center justify-start gap-2 h-12 px-4">
        <mat-icon>upload_file</mat-icon>
        Transcribir audio
      </a>
      <a mat-raised-button routerLink="/app/streaming"
         class="flex items-center justify-start gap-2 h-12 px-4">
        <mat-icon>mic</mat-icon>
        Streaming en vivo
      </a>
      <a mat-stroked-button routerLink="/app/history"
         class="flex items-center justify-start gap-2 h-12 px-4">
        <mat-icon>history</mat-icon>
        Ver historial
      </a>
    </div>
  `,
})
export class QuickActionsComponent {}
