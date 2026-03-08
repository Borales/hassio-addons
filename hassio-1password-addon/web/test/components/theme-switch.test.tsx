// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ theme: 'light', setTheme: vi.fn() }))
}));

vi.mock('@react-aria/ssr', () => ({
  useIsSSR: () => false
}));

vi.mock('@react-aria/visually-hidden', () => ({
  VisuallyHidden: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
}));

vi.mock('@heroui/switch', () => ({
  useSwitch: vi.fn(
    ({
      isSelected,
      onChange,
      'aria-label': _ariaLabel
    }: {
      isSelected: boolean;
      onChange: () => void;
      'aria-label': string;
    }) => ({
      Component: 'div',
      slots: { wrapper: ({ class: cls }: { class?: string }) => cls },
      isSelected,
      getBaseProps: (props: Record<string, unknown>) => props,
      getInputProps: () => ({ type: 'checkbox', onChange }),
      getWrapperProps: () => ({})
    })
  )
}));

vi.mock('@phosphor-icons/react/dist/ssr', () => ({
  SunIcon: () => <svg data-testid="sun-icon" />,
  MoonIcon: () => <svg data-testid="moon-icon" />
}));

vi.mock('tailwind-variants', () => ({
  tv:
    ({ base }: { base: string | string[] }) =>
    ({ className }: { className?: string | string[] } = {}) =>
      [base, className].flat().filter(Boolean).join(' ')
}));

import { ThemeSwitch } from '@/components/theme-switch';

describe('ThemeSwitch', () => {
  // When theme='light': isSelected=true, so !isSelected=false → renders MoonIcon (to switch to dark)
  it('renders MoonIcon when theme is "light" (isSelected=true)', () => {
    render(<ThemeSwitch />);
    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeDefined();
  });

  // When theme='dark': isSelected=false, so !isSelected=true → renders SunIcon (to switch to light)
  it('renders SunIcon when theme is "dark" (isSelected=false)', async () => {
    const { useTheme } = await import('next-themes');
    const { useSwitch } = await import('@heroui/switch');

    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn()
    } as unknown as ReturnType<typeof useTheme>);

    vi.mocked(useSwitch).mockReturnValue({
      Component: 'div' as unknown as ReturnType<typeof useSwitch>['Component'],
      slots: { wrapper: ({ class: cls }: { class?: string }) => cls ?? '' },
      isSelected: false,
      getBaseProps: (props: Record<string, unknown>) => props,
      getInputProps: () => ({ type: 'checkbox', onChange: vi.fn() }),
      getWrapperProps: () => ({})
    } as unknown as ReturnType<typeof useSwitch>);

    render(<ThemeSwitch />);
    const sunIcon = screen.getByTestId('sun-icon');
    expect(sunIcon).toBeDefined();
  });

  it('renders a hidden input element', () => {
    render(<ThemeSwitch />);
    const input = document.querySelector('input[type="checkbox"]');
    expect(input).toBeDefined();
  });

  it('applies custom className', () => {
    const { container } = render(<ThemeSwitch className="my-custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeDefined();
    expect(wrapper.className).toContain('my-custom-class');
  });
});
