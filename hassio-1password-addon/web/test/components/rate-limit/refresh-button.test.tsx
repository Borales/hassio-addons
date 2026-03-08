// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    isLoading,
    size,
    variant,
    type,
    startContent,
    className
  }: {
    children: React.ReactNode;
    isLoading?: boolean;
    size?: string;
    variant?: string;
    type?: string;
    startContent?: React.ReactNode;
    className?: string;
  }) => (
    <button
      type={type as 'submit' | 'button' | 'reset'}
      data-loading={isLoading ? 'true' : 'false'}
      data-size={size}
      data-variant={variant}
      className={className}
    >
      {startContent}
      {children}
    </button>
  )
}));

vi.mock('@phosphor-icons/react', () => ({
  ArrowsClockwiseIcon: ({ size }: { size?: number }) => (
    <svg data-testid="arrows-clockwise-icon" data-size={size} />
  )
}));

vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>();
  return {
    ...actual,
    useFormStatus: vi.fn(() => ({ pending: false }))
  };
});

vi.mock('@/actions/refresh-ratelimits', () => ({
  refreshRateLimits: vi.fn()
}));

import { RefreshButton } from '@/components/rate-limit/refresh-button';
import { useFormStatus } from 'react-dom';

describe('RefreshButton', () => {
  it('renders a form element', () => {
    const { container } = render(<RefreshButton />);
    const form = container.querySelector('form');
    expect(form).toBeDefined();
  });

  it('renders a submit button with translated label', () => {
    render(<RefreshButton />);
    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    expect(button.textContent).toContain('refreshButton');
  });

  it('shows the ArrowsClockwiseIcon when not pending', () => {
    vi.mocked(useFormStatus).mockReturnValue({ pending: false } as ReturnType<
      typeof useFormStatus
    >);
    render(<RefreshButton />);
    const icon = screen.getByTestId('arrows-clockwise-icon');
    expect(icon).toBeDefined();
  });

  it('hides the ArrowsClockwiseIcon when pending', () => {
    vi.mocked(useFormStatus).mockReturnValue({ pending: true } as ReturnType<
      typeof useFormStatus
    >);
    render(<RefreshButton />);
    const icon = screen.queryByTestId('arrows-clockwise-icon');
    expect(icon).toBeNull();
  });

  it('shows loading state on button when pending', () => {
    vi.mocked(useFormStatus).mockReturnValue({ pending: true } as ReturnType<
      typeof useFormStatus
    >);
    render(<RefreshButton />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('data-loading')).toBe('true');
  });
});
