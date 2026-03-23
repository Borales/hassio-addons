'use client';

import { Locale, locales } from '@/config/locales';
import { Dropdown } from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FC, useTransition } from 'react';

export interface LocaleSwitchProps {
  className?: string;
}

const localeFlags: Record<Locale, string> = {
  'en-us': '🇺🇸',
  'en-gb': '🇬🇧',
  nl: '🇳🇱',
  pl: '🇵🇱',
  de: '🇩🇪',
  uk: '🇺🇦'
};

export const LocaleSwitch: FC<LocaleSwitchProps> = ({ className }) => {
  const t = useTranslations('locale');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    startTransition(() => {
      // Set cookie and refresh to apply new locale
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    });
  };

  return (
    <Dropdown>
      <Dropdown.Trigger
        className={className}
        aria-label={t('switchLocale')}
        isDisabled={isPending}
      >
        <span className="text-2xl">{localeFlags[locale]}</span>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          aria-label={t('switchLocale')}
          onAction={(key) => handleLocaleChange(key as Locale)}
          selectedKeys={[locale]}
          selectionMode="single"
          disallowEmptySelection
        >
          {locales.map((loc) => (
            <Dropdown.Item key={loc} textValue={t(loc)} id={loc}>
              <span className="text-lg">{localeFlags[loc]}</span> {t(loc)}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
