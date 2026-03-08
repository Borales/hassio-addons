// @vitest-environment happy-dom
import { StatisticsBar } from '@/components/ui/statistics-bar';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('StatisticsBar', () => {
  it('renders visible stats with non-zero values', () => {
    const stats = [
      { label: 'total', value: 10 },
      { label: 'assigned', value: 5 }
    ];
    render(<StatisticsBar stats={stats} />);

    expect(screen.getByText('10')).toBeDefined();
    expect(screen.getByText('total')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('assigned')).toBeDefined();
  });

  it('hides stats with zero value by default', () => {
    const stats = [
      { label: 'total', value: 10 },
      { label: 'hidden', value: 0 }
    ];
    render(<StatisticsBar stats={stats} />);

    expect(screen.getByText('10')).toBeDefined();
    expect(screen.queryByText('hidden')).toBeNull();
  });

  it('shows stats with zero value when showWhenZero is true', () => {
    const stats = [{ label: 'total', value: 0, showWhenZero: true }];
    render(<StatisticsBar stats={stats} />);

    expect(screen.getByText('0')).toBeDefined();
    expect(screen.getByText('total')).toBeDefined();
  });

  it('renders separator dots between multiple visible stats', () => {
    const stats = [
      { label: 'total', value: 10 },
      { label: 'assigned', value: 5 },
      { label: 'unassigned', value: 3 }
    ];
    const { container } = render(<StatisticsBar stats={stats} />);

    const dots = container.querySelectorAll('span.text-default-300');
    expect(dots.length).toBe(2);
  });

  it('renders no separator dot for a single stat', () => {
    const stats = [{ label: 'total', value: 10 }];
    const { container } = render(<StatisticsBar stats={stats} />);

    const dots = container.querySelectorAll('span.text-default-300');
    expect(dots.length).toBe(0);
  });

  it('renders nothing visible when all stats are zero and showWhenZero is not set', () => {
    const stats = [
      { label: 'assigned', value: 0 },
      { label: 'unassigned', value: 0 }
    ];
    const { container } = render(<StatisticsBar stats={stats} />);

    const dots = container.querySelectorAll('span.text-default-300');
    expect(dots.length).toBe(0);
    expect(screen.queryByText('assigned')).toBeNull();
  });

  it('applies custom className to the container', () => {
    const stats = [{ label: 'total', value: 5 }];
    const { container } = render(
      <StatisticsBar stats={stats} className="custom-class" />
    );

    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('custom-class');
  });

  it('renders stat with success color variant', () => {
    const stats = [{ label: 'assigned', value: 3, color: 'success' as const }];
    const { container } = render(<StatisticsBar stats={stats} />);

    const successSpan = container.querySelector('.text-success-600');
    expect(successSpan).toBeDefined();
  });

  it('renders stat with warning color variant', () => {
    const stats = [{ label: 'warning', value: 2, color: 'warning' as const }];
    const { container } = render(<StatisticsBar stats={stats} />);

    const warningSpan = container.querySelector('.text-warning-600');
    expect(warningSpan).toBeDefined();
  });
});
