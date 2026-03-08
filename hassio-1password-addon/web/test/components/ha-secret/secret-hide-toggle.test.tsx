// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (_namespace: string) => (key: string) => key
}));

vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    title,
    'aria-label': ariaLabel,
    type,
    isIconOnly,
    color,
    variant,
    size
  }: {
    children: React.ReactNode;
    title?: string;
    'aria-label'?: string;
    type?: string;
    isIconOnly?: boolean;
    color?: string;
    variant?: string;
    size?: string;
  }) => (
    <button
      title={title}
      aria-label={ariaLabel}
      type={type as 'submit' | 'button' | 'reset'}
      data-icon-only={isIconOnly ? 'true' : undefined}
      data-color={color}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  )
}));

vi.mock('@phosphor-icons/react/dist/ssr', () => ({
  EyeIcon: () => <svg data-testid="eye-icon" />,
  EyeSlashIcon: () => <svg data-testid="eye-slash-icon" />
}));

vi.mock('@/actions/toggle-skip-secret', () => ({
  toggleSkipSecret: vi.fn()
}));

import { HASecretHideToggle } from '@/components/ha-secret/secret-hide-toggle';

describe('HASecretHideToggle', () => {
  it('renders a form with the secret ID as hidden input', () => {
    const { container } = render(
      <HASecretHideToggle secretId="secret-123" isSkipped={false} />
    );

    const hiddenInput = container.querySelector('input[type="hidden"]');
    expect(hiddenInput).toBeDefined();
    expect(hiddenInput?.getAttribute('name')).toBe('haSecretId');
    expect(hiddenInput?.getAttribute('value')).toBe('secret-123');
  });

  it('shows EyeSlashIcon when secret is not skipped', () => {
    render(<HASecretHideToggle secretId="secret-123" isSkipped={false} />);
    expect(screen.getByTestId('eye-slash-icon')).toBeDefined();
    expect(screen.queryByTestId('eye-icon')).toBeNull();
  });

  it('shows EyeIcon when secret is skipped', () => {
    render(<HASecretHideToggle secretId="secret-123" isSkipped={true} />);
    expect(screen.getByTestId('eye-icon')).toBeDefined();
    expect(screen.queryByTestId('eye-slash-icon')).toBeNull();
  });

  it('sets aria-label to "hide" when not skipped', () => {
    render(<HASecretHideToggle secretId="secret-123" isSkipped={false} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('hide');
  });

  it('sets aria-label to "show" when skipped', () => {
    render(<HASecretHideToggle secretId="secret-123" isSkipped={true} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('show');
  });

  it('sets title to "hide" when not skipped', () => {
    render(<HASecretHideToggle secretId="secret-123" isSkipped={false} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('title')).toBe('hide');
  });

  it('sets title to "show" when skipped', () => {
    render(<HASecretHideToggle secretId="secret-123" isSkipped={true} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('title')).toBe('show');
  });

  it('renders a submit button', () => {
    render(<HASecretHideToggle secretId="secret-123" isSkipped={false} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('submit');
  });

  it('handles null isSkipped value (treats as not skipped)', () => {
    render(<HASecretHideToggle secretId="secret-123" isSkipped={null} />);
    expect(screen.getByTestId('eye-slash-icon')).toBeDefined();
  });
});
