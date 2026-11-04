import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

export type SkeletonType = 'card' | 'list-item' | 'text-block';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [NgClass],
  styles: [`
    @keyframes skeleton-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    .skeleton { animation: skeleton-pulse 1.6s ease-in-out infinite; background: #e5e7eb; border-radius: 6px; }
  `],
  template: `
    @if (type === 'card') {
      <div class="skeleton rounded-xl p-4 flex flex-col gap-3" style="min-height:120px">
        <div class="skeleton h-4 w-1/3 rounded"></div>
        <div class="skeleton h-3 w-2/3 rounded"></div>
        <div class="skeleton h-3 w-1/2 rounded"></div>
      </div>
    }
    @if (type === 'list-item') {
      <div class="flex items-center gap-3 py-2">
        <div class="skeleton w-10 h-10 rounded-full flex-shrink-0"></div>
        <div class="flex flex-col gap-1.5 flex-1">
          <div class="skeleton h-3 w-1/2 rounded"></div>
          <div class="skeleton h-3 w-1/3 rounded"></div>
        </div>
      </div>
    }
    @if (type === 'text-block') {
      <div class="flex flex-col gap-2">
        <div class="skeleton h-3 w-full rounded"></div>
        <div class="skeleton h-3 w-5/6 rounded"></div>
        <div class="skeleton h-3 w-4/6 rounded"></div>
      </div>
    }
  `,
})
export class LoadingSkeletonComponent {
  @Input() type: SkeletonType = 'card';
}
