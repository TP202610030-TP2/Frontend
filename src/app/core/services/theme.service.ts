import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _dark = signal<boolean>(
    localStorage.getItem(STORAGE_KEY) === 'dark',
  );

  readonly isDark = this._dark.asReadonly();

  constructor() {
    this.applyTheme(this._dark());
  }

  toggleDarkMode(): void {
    const next = !this._dark();
    this._dark.set(next);
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    this.applyTheme(next);
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
  }
}
