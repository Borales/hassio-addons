// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock('@heroui/react', () => ({
  HeroUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="heroui-provider">{children}</div>
  )
}));

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  )
}));

import { Providers } from '@/components/providers';

describe('Providers', () => {
  it('renders children inside providers', () => {
    render(
      <Providers>
        <span data-testid="child">hello</span>
      </Providers>
    );
    const child = screen.getByTestId('child');
    expect(child).toBeDefined();
    expect(child.textContent).toBe('hello');
  });

  it('wraps children in HeroUIProvider', () => {
    render(
      <Providers>
        <span>content</span>
      </Providers>
    );
    const heroui = screen.getByTestId('heroui-provider');
    expect(heroui).toBeDefined();
  });

  it('wraps children in ThemeProvider', () => {
    render(
      <Providers>
        <span>content</span>
      </Providers>
    );
    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toBeDefined();
  });

  it('passes themeProps to ThemeProvider (check that attribute is forwarded)', () => {
    // The mock ThemeProvider doesn't forward props to DOM, but we verify
    // that Providers renders without error when themeProps are passed
    const { container } = render(
      <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
        <span data-testid="child-with-props">content</span>
      </Providers>
    );
    expect(container.firstChild).toBeDefined();
    const child = screen.getByTestId('child-with-props');
    expect(child).toBeDefined();
  });
});
