import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { routing } from './routing';

export default getRequestConfig(async () => {
  // Get locale from proxy header (set by the proxy/middleware)
  const headersList = await headers();
  const locale = headersList.get('x-locale') || routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
