import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MarkField } from './MarkField';

describe('MarkField', () => {
  it('renders `count` circles and is decorative', () => {
    const { container } = render(<MarkField count={40} driven="static" />);
    expect(container.querySelectorAll('circle')).toHaveLength(40);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('static/reduced-motion renders resolved positions (no NaN)', () => {
    const { container } = render(<MarkField count={20} driven="static" shape="grid" />);
    const bad = Array.from(container.querySelectorAll('circle')).some(
      (c) => Number.isNaN(Number(c.getAttribute('cx'))),
    );
    expect(bad).toBe(false);
  });
});
