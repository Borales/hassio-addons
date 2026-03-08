// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations:
    (namespace: string) => (key: string, params?: Record<string, string>) => {
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
    className,
    endContent
  }: {
    title: string;
    description: React.ReactNode;
    color?: string;
    variant?: string;
    className?: string;
    endContent?: React.ReactNode;
  }) => (
    <div
      data-testid="alert"
      data-color={color}
      data-variant={variant}
      className={className}
    >
      <span data-testid="alert-title">{title}</span>
      <div data-testid="alert-description">{description}</div>
      {endContent && <div data-testid="alert-end-content">{endContent}</div>}
    </div>
  ),
  Button: ({
    children,
    color,
    size,
    variant
  }: {
    children: React.ReactNode;
    color?: string;
    size?: string;
    variant?: string;
  }) => (
    <button data-color={color} data-size={size} data-variant={variant}>
      {children}
    </button>
  )
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>
}));

import { RateLimitWarningBanner } from '@/components/rate-limit/warning-banner';

describe('RateLimitWarningBanner', () => {
  it('renders nothing when warnings array is empty', () => {
    const { container } = render(<RateLimitWarningBanner warnings={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders an alert when there are warnings', () => {
    render(<RateLimitWarningBanner warnings={['daily']} />);
    expect(screen.getByTestId('alert')).toBeDefined();
  });

  it('renders with warning color', () => {
    render(<RateLimitWarningBanner warnings={['daily']} />);
    const alert = screen.getByTestId('alert');
    expect(alert.getAttribute('data-color')).toBe('warning');
  });

  it('renders with faded variant', () => {
    render(<RateLimitWarningBanner warnings={['daily']} />);
    const alert = screen.getByTestId('alert');
    expect(alert.getAttribute('data-variant')).toBe('faded');
  });

  it('renders the translated title', () => {
    render(<RateLimitWarningBanner warnings={['daily']} />);
    expect(screen.getByTestId('alert-title').textContent).toBe(
      'rateLimits.warning.title'
    );
  });

  it('renders daily warning label in description', () => {
    render(<RateLimitWarningBanner warnings={['daily']} />);
    const description = screen.getByTestId('alert-description');
    expect(description.textContent).toContain(
      'rateLimits.warning.labels.daily'
    );
  });

  it('renders hourlyReads warning label in description', () => {
    render(<RateLimitWarningBanner warnings={['hourlyReads']} />);
    const description = screen.getByTestId('alert-description');
    expect(description.textContent).toContain(
      'rateLimits.warning.labels.hourlyReads'
    );
  });

  it('renders multiple warning labels joined by comma', () => {
    render(<RateLimitWarningBanner warnings={['daily', 'hourlyReads']} />);
    const description = screen.getByTestId('alert-description');
    expect(description.textContent).toContain(
      'rateLimits.warning.labels.daily, rateLimits.warning.labels.hourlyReads'
    );
  });

  it('renders unknown warning keys as-is', () => {
    render(<RateLimitWarningBanner warnings={['unknownKey']} />);
    const description = screen.getByTestId('alert-description');
    expect(description.textContent).toContain('unknownKey');
  });

  it('renders a view details link button', () => {
    render(<RateLimitWarningBanner warnings={['daily']} />);
    expect(screen.getByTestId('alert-end-content')).toBeDefined();
    expect(screen.getByText('rateLimits.warning.viewDetails')).toBeDefined();
  });

  it('links to the rate-limits page', () => {
    render(<RateLimitWarningBanner warnings={['daily']} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('./rate-limits');
  });

  it('applies mb-4 margin class', () => {
    render(<RateLimitWarningBanner warnings={['daily']} />);
    const alert = screen.getByTestId('alert');
    expect(alert.className).toContain('mb-4');
  });
});
