import { Component, inject, signal } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThemeService } from '@core/services/theme.service';

export interface InterfaceLanguage {
  code:      string;
  label:     string;
  available: boolean;
}

/** HU0009 — idiomas de la interfaz: disponibles y próximos a habilitarse. */
export const INTERFACE_LANGUAGES: readonly InterfaceLanguage[] = [
  { code: 'es', label: 'Español',             available: true  },
  { code: 'qu', label: 'Quechua (Runasimi)',  available: false },
];

export const comingSoonMessage = (label: string) =>
  `El idioma ${label} estará disponible próximamente.`;

@Component({
  selector: 'app-preferences-section',
  standalone: true,
  imports: [MatSlideToggleModule, MatFormFieldModule, MatSelectModule, MatTooltipModule],
  template: `
    <div class="flex flex-col gap-5">

      <!-- Idioma -->
      <div>
        <p class="text-sm font-medium" style="color:var(--text-primary);margin:0 0 8px">Idioma de la interfaz</p>
        <mat-form-field appearance="outline" class="w-full max-w-xs">
          <mat-label>Idioma</mat-label>
          <mat-select [value]="selectedLang()" (selectionChange)="onLanguageChange($event)"
                      data-testid="language-select">
            @for (lang of languages; track lang.code) {
              <mat-option [value]="lang.code" [attr.data-testid]="'lang-' + lang.code">
                {{ lang.label }}
                @if (!lang.available) {
                  <span class="lang-soon">Próximamente</span>
                }
              </mat-option>
            }
          </mat-select>
          <mat-hint>Disponible: {{ availableLabels }}. Próximamente: {{ upcomingLabels }}.</mat-hint>
        </mat-form-field>

        @if (comingSoonMsg()) {
          <p class="text-sm mt-2" role="status" data-testid="lang-coming-soon"
             style="color:var(--text-secondary)">
            {{ comingSoonMsg() }}
          </p>
        }
      </div>

    </div>
  `,
  styles: [`
    .lang-soon {
      margin-left: 8px;
      padding: 1px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 500;
      background: rgba(234, 179, 8, 0.18);
      color: #a16207;
    }
  `],
})
export class PreferencesSectionComponent {
  readonly themeSvc = inject(ThemeService);
  private readonly snackBar = inject(MatSnackBar);

  readonly languages      = INTERFACE_LANGUAGES;
  readonly availableLabels = INTERFACE_LANGUAGES.filter(l => l.available).map(l => l.label).join(', ');
  readonly upcomingLabels  = INTERFACE_LANGUAGES.filter(l => !l.available).map(l => l.label).join(', ');

  readonly selectedLang  = signal('es');
  readonly comingSoonMsg = signal<string | null>(null);

  onLanguageChange(event: MatSelectChange): void {
    const lang = this.languages.find(l => l.code === event.value);
    if (lang?.available) {
      this.selectedLang.set(lang.code);
      this.comingSoonMsg.set(null);
      return;
    }
    // Idioma aún no habilitado: se informa y se mantiene el idioma actual.
    const msg = comingSoonMessage(lang?.label ?? String(event.value));
    event.source.writeValue(this.selectedLang());
    this.comingSoonMsg.set(msg);
    this.snackBar.open(msg, 'Cerrar', { duration: 4000, verticalPosition: 'bottom' });
  }
}
