export const locales = ['en-us', 'en-gb', 'pl', 'de', 'nl', 'uk'] as const;

export type Locale = (typeof locales)[number];
