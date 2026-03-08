// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key,
  useLocale: () => 'en-us'
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() })
}));

vi.mock('@heroui/react', () => ({
  Dropdown: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown">{children}</div>
  ),
  DropdownTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenu: ({
    children,
    onAction,
    'aria-label': ariaLabel
  }: {
    children: React.ReactNode;
    onAction?: (key: string) => void;
    'aria-label'?: string;
  }) => (
    <div
      data-testid="dropdown-menu"
      aria-label={ariaLabel}
      data-on-action={String(!!onAction)}
    >
      {typeof children === 'function' ? null : children}
    </div>
  ),
  DropdownItem: ({
    children,
    startContent
  }: {
    children: React.ReactNode;
    startContent?: React.ReactNode;
  }) => (
    <div data-testid="dropdown-item">
      {startContent}
      {children}
    </div>
  ),
  Button: ({
    children,
    'aria-label': ariaLabel,
    isDisabled,
    className
  }: {
    children: React.ReactNode;
    'aria-label'?: string;
    isDisabled?: boolean;
    className?: string;
  }) => (
    <button aria-label={ariaLabel} disabled={isDisabled} className={className}>
      {children}
    </button>
  )
}));

import { LocaleSwitch } from '@/components/locale-switch';

describe('LocaleSwitch', () => {
  it('renders a button with aria-label "switchLocale"', () => {
    render(<LocaleSwitch />);
    const button = screen.getByRole('button', { name: 'switchLocale' });
    expect(button).toBeDefined();
  });

  it('shows the flag emoji for the current locale (en-us → 🇺🇸)', () => {
    render(<LocaleSwitch />);
    const trigger = screen.getByTestId('dropdown-trigger');
    expect(trigger.textContent).toContain('🇺🇸');
  });

  it('renders dropdown items for all 6 locales', () => {
    render(<LocaleSwitch />);
    const items = screen.getAllByTestId('dropdown-item');
    expect(items.length).toBe(6);
  });

  it('each dropdown item shows the translated locale name', () => {
    render(<LocaleSwitch />);
    const items = screen.getAllByTestId('dropdown-item');
    const locales = ['en-us', 'en-gb', 'pl', 'de', 'nl', 'uk'];
    locales.forEach((loc, i) => {
      expect(items[i].textContent).toContain(loc);
    });
  });

  it('applies custom className to the button', () => {
    render(<LocaleSwitch className="custom-class" />);
    const button = screen.getByRole('button', { name: 'switchLocale' });
    expect(button.className).toContain('custom-class');
  });

  it('button is not disabled initially (isPending=false)', () => {
    render(<LocaleSwitch />);
    const button = screen.getByRole('button', { name: 'switchLocale' });
    expect(button.hasAttribute('disabled')).toBe(false);
  });
});
