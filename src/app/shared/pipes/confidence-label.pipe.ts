import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'confidenceLabel', standalone: true, pure: true })
export class ConfidenceLabelPipe implements PipeTransform {
  transform(value: number): string {
    return `${Math.round(value * 100)}%`;
  }
}
