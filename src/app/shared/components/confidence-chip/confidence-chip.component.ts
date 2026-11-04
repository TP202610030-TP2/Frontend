import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-confidence-chip',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <span
      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      [class]="chipClass"
      [attr.aria-label]="'Confianza: ' + (confidence * 100 | number:'1.0-0') + '%'">
      {{ confidence * 100 | number:'1.0-0' }}%
    </span>
  `,
})
export class ConfidenceChipComponent {
  @Input({ required: true }) confidence!: number;

  get chipClass(): string {
    if (this.confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (this.confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }
}
