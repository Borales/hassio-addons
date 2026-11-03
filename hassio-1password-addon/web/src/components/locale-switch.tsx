'use client';

import { Locale, localeInfo, locales } from '@/config/locales';
import { GlobeIcon } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

const useLocaleChange = () => {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const changeLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    });
  };

  return { locale, changeLocale, isPending };
};

export const LocaleSwitch = () => {
  const t = useTranslations('locale');
  const { locale, changeLocale, isPending } = useLocaleChange();

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className={`btn btn-ghost btn-sm gap-1.5 px-2 ${isPending ? 'btn-disabled' : ''}`}
        aria-label={t('switchLocale')}
      >
        <GlobeIcon size={15} />
        <span className="text-[12px] font-medium">
          {localeInfo[locale].short}
        </span>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu menu-sm bg-base-200 rounded-box hairline z-30 mt-1 w-48 border p-1.5 shadow-xl"
      >
        {locales.map((loc) => (
          <li key={loc}>
            <button
              type="button"
              className={loc === locale ? 'menu-active' : ''}
              onClick={() => {
                changeLocale(loc);
                (document.activeElement as HTMLElement)?.blur();
              }}
            >
              <span className="flex-1">{localeInfo[loc].label}</span>
              <span className="font-mono text-[11px] opacity-50">{loc}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Native picker for the mobile "More" menu. */
export const LocaleSelect = () => {
  const t = useTranslations('locale');
  const { locale, changeLocale, isPending } = useLocaleChange();

  return (
    <label className="hairline mt-1 flex items-center gap-2 border-t px-3 pt-2 pb-2.5 text-[13px]">
      <GlobeIcon size={16} className="shrink-0" />
      <span className="sr-only">{t('switchLocale')}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(event) => changeLocale(event.target.value as Locale)}
        className="select select-sm w-full"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeInfo[loc].label}
          </option>
        ))}
      </select>
    </label>
  );
};
