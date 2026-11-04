import 'jest-preset-angular/setup-jest';

// jsdom no implementa IntersectionObserver — usado por animaciones de scroll-reveal
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

(global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIntersectionObserver;
