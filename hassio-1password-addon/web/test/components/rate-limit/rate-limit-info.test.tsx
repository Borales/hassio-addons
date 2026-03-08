// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations:
    (namespace: string) => (key: string, params?: Record<string, unknown>) => {
      if (params) return `${namespace}.${key}(${JSON.stringify(params)})`;
      return `${namespace}.${key}`;
    }
}));

vi.mock('@heroui/react', () => ({
  Alert: ({
    title,
    description,
    color,
    variant,
    className
  }: {
    title: string;
    description: React.ReactNode;
    color?: string;
    variant?: string;
    className?: string;
  }) => (
    <div
      data-testid="alert"
      data-color={color}
      data-variant={variant}
      className={className}
    >
      <span data-testid="alert-title">{title}</span>
      <div data-testid="alert-description">{description}</div>
    </div>
  )
}));

import { RateLimitInfo } from '@/components/rate-limit/rate-limit-info';

describe('RateLimitInfo', () => {
  const defaultProps = {
    accountName: 'my-account',
    dailyLimit: 1000,
    hourlyReadLimit: 500
  };

  it('renders an alert with default color', () => {
    render(<RateLimitInfo {...defaultProps} />);
    const alert = screen.getByTestId('alert');
    expect(alert.getAttribute('data-color')).toBe('default');
  });

  it('renders with faded variant', () => {
    render(<RateLimitInfo {...defaultProps} />);
    const alert = screen.getByTestId('alert');
    expect(alert.getAttribute('data-variant')).toBe('faded');
  });

  it('renders the translated title', () => {
    render(<RateLimitInfo {...defaultProps} />);
    expect(screen.getByTestId('alert-title').textContent).toBe(
      'rateLimits.info.title'
    );
  });

  it('renders the account name in the description', () => {
    render(<RateLimitInfo {...defaultProps} />);
    expect(screen.getByText('my-account')).toBeDefined();
  });

  it('renders the daily limit value', () => {
    render(<RateLimitInfo {...defaultProps} />);
    const description = screen.getByTestId('alert-description');
    expect(description.textContent).toContain(
      'rateLimits.info.requests({"count":1000})'
    );
  });

  it('renders the hourly read limit value', () => {
    render(<RateLimitInfo {...defaultProps} />);
    const description = screen.getByTestId('alert-description');
    expect(description.textContent).toContain(
      'rateLimits.info.requests({"count":500})'
    );
  });

  it('renders the daily limit label', () => {
    render(<RateLimitInfo {...defaultProps} />);
    const description = screen.getByTestId('alert-description');
    expect(description.textContent).toContain('rateLimits.info.dailyLimit');
  });

  it('renders the hourly read limit label', () => {
    render(<RateLimitInfo {...defaultProps} />);
    const description = screen.getByTestId('alert-description');
    expect(description.textContent).toContain(
      'rateLimits.info.hourlyReadLimit'
    );
  });

  it('renders the read-only note', () => {
    render(<RateLimitInfo {...defaultProps} />);
    const description = screen.getByTestId('alert-description');
    expect(description.textContent).toContain('rateLimits.info.readOnlyNote');
  });

  it('applies mt-6 margin class', () => {
    render(<RateLimitInfo {...defaultProps} />);
    const alert = screen.getByTestId('alert');
    expect(alert.className).toContain('mt-6');
  });

  it('renders with different account name', () => {
    render(
      <RateLimitInfo
        accountName="another-account"
        dailyLimit={5000}
        hourlyReadLimit={2000}
      />
    );
    expect(screen.getByText('another-account')).toBeDefined();
  });
});
