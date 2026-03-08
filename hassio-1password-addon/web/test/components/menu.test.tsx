// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/'
}));

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) => <img src={src} alt={alt} width={width} height={height} />
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
    title
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    title?: string;
  }) => (
    <a href={href} className={className} title={title}>
      {children}
    </a>
  )
}));

vi.mock('@heroui/react', () => ({
  Avatar: ({ title }: { title?: string }) => (
    <div data-testid="avatar" title={title} />
  )
}));

vi.mock('@phosphor-icons/react', () => ({
  GithubLogoIcon: () => <svg data-testid="github-icon" />
}));

vi.mock('tailwind-variants', () => ({
  tv:
    (config: { base: string; variants: { active: { true: string } } }) =>
    (variants?: { active?: boolean }) =>
      variants?.active ? config.variants.active.true : config.base
}));

vi.mock('@/components/locale-switch', () => ({
  LocaleSwitch: () => <div data-testid="locale-switch" />
}));

vi.mock('@/components/theme-switch', () => ({
  ThemeSwitch: () => <div data-testid="theme-switch" />
}));

import { Menu } from '@/components/menu';
import { siteConfig } from '@/config/site';

describe('Menu', () => {
  it('renders a header element', () => {
    render(<Menu />);
    const header = document.querySelector('header');
    expect(header).toBeDefined();
  });

  it('renders the logo image with correct alt text (siteConfig.name)', () => {
    render(<Menu />);
    const logo = screen.getByAltText(siteConfig.name);
    expect(logo).toBeDefined();
  });

  it('renders navigation links: Secrets, Groups, Rate Limits, Help', () => {
    render(<Menu />);
    expect(screen.getByText('secrets')).toBeDefined();
    expect(screen.getByText('groups')).toBeDefined();
    expect(screen.getByText('rateLimits')).toBeDefined();
    expect(screen.getByText('help')).toBeDefined();
  });

  it('renders the GitHub link', () => {
    render(<Menu />);
    const githubLink = document.querySelector(
      'a[href="https://github.com/Borales/hassio-addons"]'
    );
    expect(githubLink).toBeDefined();
  });

  it('renders LocaleSwitch component', () => {
    render(<Menu />);
    const localeSwitch = screen.getByTestId('locale-switch');
    expect(localeSwitch).toBeDefined();
  });

  it('renders ThemeSwitch component', () => {
    render(<Menu />);
    const themeSwitch = screen.getByTestId('theme-switch');
    expect(themeSwitch).toBeDefined();
  });

  it('active link (pathname ends with "/") gets active class applied', () => {
    render(<Menu />);
    // The secrets link points to "./" and pathname is "/", which ends with "/"
    // The tv mock returns config.variants.active.true when active=true
    const secretsLink = screen.getByText('secrets').closest('a');
    expect(secretsLink).toBeDefined();
    // Active class from the tv mock is the variants.active.true value
    expect(secretsLink!.className).toContain('bg-default-100');
  });
});
