// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`
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
    description: string;
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
      <span data-testid="alert-description">{description}</span>
    </div>
  )
}));

import { ServiceAccountWarning } from '@/components/service-account-warning';

describe('ServiceAccountWarning', () => {
  it('renders an alert with danger color', () => {
    render(<ServiceAccountWarning />);

    const alert = screen.getByTestId('alert');
    expect(alert.getAttribute('data-color')).toBe('danger');
  });

  it('renders with faded variant', () => {
    render(<ServiceAccountWarning />);

    const alert = screen.getByTestId('alert');
    expect(alert.getAttribute('data-variant')).toBe('faded');
  });

  it('renders the translated title', () => {
    render(<ServiceAccountWarning />);

    expect(screen.getByTestId('alert-title').textContent).toBe(
      'serviceAccountWarning.title'
    );
  });

  it('renders the translated description', () => {
    render(<ServiceAccountWarning />);

    expect(screen.getByTestId('alert-description').textContent).toBe(
      'serviceAccountWarning.description'
    );
  });

  it('applies mb-4 margin class', () => {
    render(<ServiceAccountWarning />);

    const alert = screen.getByTestId('alert');
    expect(alert.className).toContain('mb-4');
  });
});
