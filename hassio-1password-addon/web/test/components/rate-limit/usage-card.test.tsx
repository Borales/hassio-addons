// @vitest-environment happy-dom
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations:
    (_ns: string) => (key: string, params?: Record<string, unknown>) =>
      params ? `${key}(${JSON.stringify(params)})` : key
}));

vi.mock('@heroui/react', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardBody: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-body">{children}</div>
  ),
  Progress: ({
    value,
    color,
    'aria-label': ariaLabel
  }: {
    value: number;
    color: string;
    'aria-label': string;
  }) => (
    <div
      data-testid="progress"
      data-value={value}
      data-color={color}
      aria-label={ariaLabel}
    />
  )
}));

vi.mock('tailwind-variants', () => ({
  tv:
    () =>
    ({ usage }: { usage: string }) =>
      usage
}));

import { UsageCard } from '@/components/rate-limit/usage-card';

describe('UsageCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-22T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    title: 'API Requests',
    description: 'Monthly API request limit',
    used: 50,
    limit: 100,
    reset: '2020-01-01T00:00:00.000Z' // past date so no countdown shown
  };

  it('renders the title', () => {
    render(<UsageCard {...defaultProps} />);
    expect(screen.getByText('API Requests')).toBeDefined();
  });

  it('renders the description', () => {
    render(<UsageCard {...defaultProps} />);
    expect(screen.getByText('Monthly API request limit')).toBeDefined();
  });

  it('renders used count', () => {
    render(<UsageCard {...defaultProps} />);
    expect(screen.getByText('50')).toBeDefined();
  });

  it('renders limit count', () => {
    render(<UsageCard {...defaultProps} />);
    expect(screen.getByText(/\/ 100/)).toBeDefined();
  });

  it('renders progress bar with correct percentage value (50/100 = 50%)', () => {
    render(<UsageCard {...defaultProps} used={50} limit={100} />);
    const progress = screen.getByTestId('progress');
    expect(progress.getAttribute('data-value')).toBe('50');
  });

  it("renders progress bar with 'low' color when usage < 50%", () => {
    render(<UsageCard {...defaultProps} used={40} limit={100} />);
    const progress = screen.getByTestId('progress');
    expect(progress.getAttribute('data-color')).toBe('low');
  });

  it("renders progress bar with 'medium' color when usage >= 50% and < 75%", () => {
    render(<UsageCard {...defaultProps} used={60} limit={100} />);
    const progress = screen.getByTestId('progress');
    expect(progress.getAttribute('data-color')).toBe('medium');
  });

  it("renders progress bar with 'high' color when usage >= 75% and < 90%", () => {
    render(<UsageCard {...defaultProps} used={80} limit={100} />);
    const progress = screen.getByTestId('progress');
    expect(progress.getAttribute('data-color')).toBe('high');
  });

  it("renders progress bar with 'critical' color when usage >= 90%", () => {
    render(<UsageCard {...defaultProps} used={95} limit={100} />);
    const progress = screen.getByTestId('progress');
    expect(progress.getAttribute('data-color')).toBe('critical');
  });

  it('percentage is capped at 100 when used > limit', () => {
    render(<UsageCard {...defaultProps} used={150} limit={100} />);
    const progress = screen.getByTestId('progress');
    expect(progress.getAttribute('data-value')).toBe('100');
  });

  it('percentage is 0 when limit is 0', () => {
    render(<UsageCard {...defaultProps} used={50} limit={0} />);
    const progress = screen.getByTestId('progress');
    expect(progress.getAttribute('data-value')).toBe('0');
  });

  it('reset countdown is NOT shown when reset is in the past (secondsUntilReset = 0)', () => {
    const { container } = render(
      <UsageCard {...defaultProps} reset="2020-01-01T00:00:00.000Z" />
    );
    // The countdown div only renders when secondsUntilReset > 0
    const resetDiv = container.querySelector('.border-divider');
    expect(resetDiv).toBeNull();
  });

  it('reset countdown IS shown when reset is in the future', () => {
    act(() => {
      render(
        <UsageCard
          {...defaultProps}
          reset="2026-02-22T14:00:00.000Z" // 2 hours in the future from mocked now
        />
      );
    });
    const resetDiv = screen.getByText(/resetsInHours/);
    expect(resetDiv).toBeDefined();
  });
});
