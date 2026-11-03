// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { locale } from '../helpers/next-intl';

const router = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock('next-intl', () => import('../helpers/next-intl'));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

import { LocaleSelect, LocaleSwitch } from '@/components/locale-switch';
import { localeInfo, locales } from '@/config/locales';

const clearLocaleCookie = () => {
  document.cookie = 'NEXT_LOCALE=; path=/; max-age=0';
};

beforeEach(() => {
  vi.clearAllMocks();
  locale.mockReturnValue('pl');
});

afterEach(clearLocaleCookie);

describe('LocaleSwitch', () => {
  it('shows the short code of the current locale', () => {
    render(<LocaleSwitch />);

    expect(
      screen.getByRole('button', { name: 'switchLocale' }).textContent
    ).toBe(localeInfo.pl.short);
  });

  it('lists every locale and highlights the current one', () => {
    render(<LocaleSwitch />);

    for (const loc of locales) {
      const option = screen.getByText(localeInfo[loc].label).closest('button');
      expect(option?.className.includes('menu-active')).toBe(loc === 'pl');
    }
  });

  it('stores the chosen locale in a cookie and refreshes', async () => {
    render(<LocaleSwitch />);

    await act(async () =>
      fireEvent.click(screen.getByText(localeInfo.de.label))
    );

    expect(document.cookie).toContain('NEXT_LOCALE=de');
    expect(router.refresh).toHaveBeenCalledOnce();
  });

  it('does nothing when choosing the current locale', async () => {
    render(<LocaleSwitch />);

    await act(async () =>
      fireEvent.click(screen.getByText(localeInfo.pl.label))
    );

    expect(document.cookie).not.toContain('NEXT_LOCALE');
    expect(router.refresh).not.toHaveBeenCalled();
  });
});

describe('LocaleSelect', () => {
  const select = () =>
    screen.getByRole<HTMLSelectElement>('combobox', { name: 'switchLocale' });

  it('selects the current locale among every locale', () => {
    render(<LocaleSelect />);

    expect(select().value).toBe('pl');
    expect(screen.getAllByRole('option')).toHaveLength(locales.length);
  });

  it('stores the chosen locale in a cookie and refreshes', async () => {
    render(<LocaleSelect />);

    await act(async () =>
      fireEvent.change(select(), { target: { value: 'uk' } })
    );

    expect(document.cookie).toContain('NEXT_LOCALE=uk');
    expect(router.refresh).toHaveBeenCalledOnce();
  });
});
