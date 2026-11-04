import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime', standalone: true, pure: false })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date): string {
    const diff = Date.now() - new Date(value).getTime();
    const secs = Math.floor(diff / 1000);
    const mins = Math.floor(secs / 60);
    const hrs  = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (secs < 60)  return 'hace un momento';
    if (mins < 60)  return `hace ${mins} min`;
    if (hrs < 24)   return `hace ${hrs} h`;
    if (days === 1) return 'ayer';
    return `hace ${days} días`;
  }
}
