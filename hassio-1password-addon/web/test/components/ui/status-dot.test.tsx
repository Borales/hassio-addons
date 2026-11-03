// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusDot } from '@/components/ui/status-dot';

describe('StatusDot', () => {
  it.each(['assigned', 'unassigned', 'hidden', 'broken'] as const)(
    'draws the %s status',
    (status) => {
      const { container } = render(<StatusDot status={status} />);
      expect(container.querySelector(`.dot-${status}`)).not.toBeNull();
    }
  );

  it('names the status when labelled', () => {
    render(<StatusDot status="broken" label="Broken" />);
    expect(screen.getByRole('img', { name: 'Broken' })).toBeDefined();
  });

  it('is decorative without a label', () => {
    const { container } = render(<StatusDot status="broken" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
      'true'
    );
  });
});
