// @vitest-environment happy-dom
import { siteConfig } from '@/config/site';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({
  pathname: '/',
  router: { refresh: vi.fn() }
}));

vi.mock('next-intl', () => import('../helpers/next-intl'));
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark', setTheme: vi.fn() })
}));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => navigation.router
}));
vi.mock('@/actions/force-update', () => ({ forceUpdateNow: vi.fn() }));

import { Menu } from '@/components/menu';
import { ToastProvider } from '@/components/ui/toast-provider';

const setup = (nextUpdate?: string | null) =>
  render(
    <ToastProvider>
      <Menu nextUpdate={nextUpdate} />
    </ToastProvider>
  );

const nav = () => within(screen.getByRole('navigation', { name: 'main' }));

describe('Menu', () => {
  beforeEach(() => {
    navigation.pathname = '/';
  });

  it('links the logo home, naming the app and version', () => {
    setup();

    const home = screen.getByRole('link', {
      name: `${siteConfig.name}, version ${siteConfig.version}`
    });
    expect(home.getAttribute('href')).toBe('./');
    expect(home.textContent).toContain(`v${siteConfig.version}`);
  });

  it('links every page with relative hrefs, for the ingress sub-path', () => {
    setup();

    expect(
      nav()
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
    ).toEqual(['./', './groups', './rate-limits', './help']);
  });

  it.each([
    ['/', 'secrets'],
    ['/groups', 'groups'],
    ['/rate-limits', 'rateLimits'],
    ['/help', 'help']
  ])('marks the current page on %s', (pathname, active) => {
    navigation.pathname = pathname;
    setup();

    const current = nav()
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');

    expect(current).toEqual([nav().getByRole('link', { name: active })]);
  });

  it('links to the repository in a new tab', () => {
    setup();

    const github = screen.getByRole('link', { name: 'github' });
    expect(github.getAttribute('href')).toBe(siteConfig.repo);
    expect(github.getAttribute('target')).toBe('_blank');
  });

  it('holds back the sync pill until the status has loaded', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'notSyncedPill' })).toBeNull();
  });

  it('shows the sync pill once loaded, even when never synced', () => {
    setup(null);
    expect(screen.getByRole('button', { name: 'notSyncedPill' })).toBeDefined();
  });

  it('holds the theme, locale and repo links in the mobile "more" menu', () => {
    setup();

    const more = screen.getByRole('button', { name: 'more' }).parentElement!;
    expect(
      within(more).getByRole('button', { name: 'lightMode' })
    ).toBeDefined();
    expect(within(more).getByRole('combobox')).toBeDefined();
    expect(
      within(more)
        .getByRole('link', { name: 'githubShort' })
        .getAttribute('href')
    ).toBe(siteConfig.repo);
  });
});
