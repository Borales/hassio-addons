import { locales } from '@/config/locales';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: locales as unknown as string[],

  // Used when no locale matches
  defaultLocale: 'en-us',

  // Don't use locale prefixes in URLs since we're using cookie/header based detection
  localePrefix: 'never',

  localeCookie: {
    // Custom cookie name
    name: 'NEXT_LOCALE',
    // Expire in one year
    maxAge: 60 * 60 * 24 * 365
  },

  // Disable automatic locale detection from Accept-Language header
  // since we're using custom proxy header (x-locale)
  localeDetection: false
});
