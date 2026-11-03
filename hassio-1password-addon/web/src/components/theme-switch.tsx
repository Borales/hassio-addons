'use client';

import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/** The theme is only known in the browser, so the server renders the default. */
const useThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const isDark = !mounted || resolvedTheme === 'dark';

  return { isDark, toggle: () => setTheme(isDark ? 'light' : 'dark') };
};

export const ThemeSwitch = () => {
  const t = useTranslations('theme');
  const { isDark, toggle } = useThemeToggle();
  const label = isDark ? t('switchToLight') : t('switchToDark');

  return (
    <span className="tooltip tooltip-bottom tooltip-left" data-tip={label}>
      <button
        type="button"
        onClick={toggle}
        className="btn btn-ghost btn-sm btn-square"
        aria-label={label}
      >
        {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      </button>
    </span>
  );
};

export const ThemeMenuItem = ({ onToggle }: { onToggle?: () => void }) => {
  const t = useTranslations('theme');
  const { isDark, toggle } = useThemeToggle();

  return (
    <button
      type="button"
      className="py-2.5"
      onClick={() => {
        toggle();
        onToggle?.();
      }}
    >
      {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      {isDark ? t('lightMode') : t('darkMode')}
    </button>
  );
};
