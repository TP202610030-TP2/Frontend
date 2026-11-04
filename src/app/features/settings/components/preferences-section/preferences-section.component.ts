import { Component, inject } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-preferences-section',
  standalone: true,
  imports: [FormsModule, MatSlideToggleModule, MatFormFieldModule, MatSelectModule, MatTooltipModule],
  template: `
    <div class="flex flex-col gap-5">

      <!-- Idioma -->
      <div>
        <p class="text-sm font-medium" style="color:var(--text-primary);margin:0 0 8px">Idioma de la interfaz</p>
        <mat-form-field appearance="outline" class="w-full max-w-xs">
          <mat-label>Idioma</mat-label>
          <mat-select [(ngModel)]="selectedLang" disabled>
            <mat-option value="es">Español</mat-option>
            <mat-option value="qu" [disabled]="true" matTooltip="Próximamente">Quechua</mat-option>
          </mat-select>
          <mat-hint>Español es el único idioma disponible actualmente.</mat-hint>
        </mat-form-field>
      </div>

    </div>
  `,
})
export class PreferencesSectionComponent {
  readonly themeSvc = inject(ThemeService);
  selectedLang = 'es';
}
