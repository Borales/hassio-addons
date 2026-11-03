// @vitest-environment happy-dom
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next-intl', () => import('../helpers/next-intl'));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname
}));

import { MobileTabBar } from '@/components/mobile-tab-bar';

const tab = (name: string) =>
  within(screen.getByRole('navigation', { name: 'main' })).getByRole('link', {
    name
  });

/** The dot next to the tab's icon. */
const badge = (name: string) => tab(name).querySelector('span.relative > span');

describe('MobileTabBar', () => {
  beforeEach(() => {
    navigation.pathname = '/';
  });

  it('links every tab, using the short label for rate limits', () => {
    render(<MobileTabBar />);

    expect(tab('secrets').getAttribute('href')).toBe('./');
    expect(tab('groups').getAttribute('href')).toBe('./groups');
    expect(tab('rateLimitsShort').getAttribute('href')).toBe('./rate-limits');
    expect(tab('help').getAttribute('href')).toBe('./help');
  });

  it.each([
    ['/', 'secrets'],
    ['/ingress/abc/', 'secrets'],
    ['/groups', 'groups'],
    ['/rate-limits', 'rateLimitsShort'],
    ['/help', 'help']
  ])('marks the current tab on %s', (pathname, active) => {
    navigation.pathname = pathname;
    render(<MobileTabBar />);

    const current = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');

    expect(current).toEqual([tab(active)]);
  });

  it.each(['error', 'warning'] as const)(
    'shows a %s badge on the secrets tab only',
    (kind) => {
      render(<MobileTabBar badge={kind} />);

      expect(badge('secrets')).not.toBeNull();
      expect(badge('groups')).toBeNull();
    }
  );

  it.each([undefined, null])('shows no badge for %s', (value) => {
    render(<MobileTabBar badge={value} />);
    expect(badge('secrets')).toBeNull();
  });
});
