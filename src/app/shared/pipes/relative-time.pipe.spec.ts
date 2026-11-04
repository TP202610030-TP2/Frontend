import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  const pipe = new RelativeTimePipe();

  function ago(ms: number): string {
    return new Date(Date.now() - ms).toISOString();
  }

  it('menos de 60 segundos → "hace un momento"', () => {
    expect(pipe.transform(ago(30_000))).toBe('hace un momento');
  });

  it('minutos → "hace X min"', () => {
    expect(pipe.transform(ago(15 * 60_000))).toBe('hace 15 min');
  });

  it('ayer (24–48 h) → "ayer"', () => {
    expect(pipe.transform(ago(25 * 3_600_000))).toBe('ayer');
  });

  it('varios días → "hace X días"', () => {
    expect(pipe.transform(ago(5 * 86_400_000))).toBe('hace 5 días');
  });
});
