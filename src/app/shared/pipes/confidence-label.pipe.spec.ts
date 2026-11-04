import { ConfidenceLabelPipe } from './confidence-label.pipe';

describe('ConfidenceLabelPipe', () => {
  const pipe = new ConfidenceLabelPipe();

  it('0.92 → "92%"', () => {
    expect(pipe.transform(0.92)).toBe('92%');
  });

  it('0.5 → "50%"', () => {
    expect(pipe.transform(0.5)).toBe('50%');
  });

  it('0.0 → "0%"', () => {
    expect(pipe.transform(0)).toBe('0%');
  });

  it('1.0 → "100%"', () => {
    expect(pipe.transform(1)).toBe('100%');
  });
});
