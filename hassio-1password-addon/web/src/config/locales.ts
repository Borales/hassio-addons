export const locales = ['en-us', 'en-gb', 'pl', 'de', 'nl', 'uk'] as const;

export type Locale = (typeof locales)[number];

// Language names are shown in their own language, so they are not translated.
export const localeInfo: Record<Locale, { label: string; short: string }> = {
  'en-us': { label: 'English (US)', short: 'EN' },
  'en-gb': { label: 'English (UK)', short: 'EN' },
  de: { label: 'Deutsch', short: 'DE' },
  nl: { label: 'Nederlands', short: 'NL' },
  pl: { label: 'Polski', short: 'PL' },
  uk: { label: 'Українська', short: 'UK' }
};
