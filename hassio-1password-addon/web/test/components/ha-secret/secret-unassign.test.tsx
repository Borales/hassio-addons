// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (_namespace: string) => (key: string) => key
}));

vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    'aria-label': ariaLabel,
    title,
    type,
    color,
    variant,
    size,
    isIconOnly
  }: {
    children: React.ReactNode;
    'aria-label'?: string;
    title?: string;
    type?: string;
    color?: string;
    variant?: string;
    size?: string;
    isIconOnly?: boolean;
  }) => (
    <button
      aria-label={ariaLabel}
      title={title}
      type={type as 'submit' | 'button' | 'reset'}
      data-color={color}
      data-variant={variant}
      data-size={size}
      data-icon-only={isIconOnly ? 'true' : undefined}
    >
      {children}
    </button>
  )
}));

vi.mock('@phosphor-icons/react', () => ({
  LinkBreakIcon: () => <svg data-testid="link-break-icon" />
}));

vi.mock('@/actions/unassign-secret', () => ({
  unassignSecret: vi.fn()
}));

import { HASecretUnassign } from '@/components/ha-secret/secret-unassign';

describe('HASecretUnassign', () => {
  it('renders nothing when isAssigned is false', () => {
    const { container } = render(
      <HASecretUnassign secretId="secret-123" isAssigned={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a form when isAssigned is true', () => {
    const { container } = render(
      <HASecretUnassign secretId="secret-123" isAssigned={true} />
    );
    const form = container.querySelector('form');
    expect(form).toBeDefined();
  });

  it('renders the hidden secret ID input', () => {
    const { container } = render(
      <HASecretUnassign secretId="secret-456" isAssigned={true} />
    );
    const hiddenInput = container.querySelector('input[type="hidden"]');
    expect(hiddenInput?.getAttribute('name')).toBe('haSecretId');
    expect(hiddenInput?.getAttribute('value')).toBe('secret-456');
  });

  it('renders the LinkBreakIcon', () => {
    render(<HASecretUnassign secretId="secret-123" isAssigned={true} />);
    expect(screen.getByTestId('link-break-icon')).toBeDefined();
  });

  it('sets aria-label to "unassign"', () => {
    render(<HASecretUnassign secretId="secret-123" isAssigned={true} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('unassign');
  });

  it('sets title to "unassign"', () => {
    render(<HASecretUnassign secretId="secret-123" isAssigned={true} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('title')).toBe('unassign');
  });

  it('renders a submit button', () => {
    render(<HASecretUnassign secretId="secret-123" isAssigned={true} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('submit');
  });

  it('renders with danger color', () => {
    render(<HASecretUnassign secretId="secret-123" isAssigned={true} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('data-color')).toBe('danger');
  });
});
