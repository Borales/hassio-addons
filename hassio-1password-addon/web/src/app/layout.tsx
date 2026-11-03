import './globals.css';
import { Menu } from '@/components/menu';
import { MobileTabBar } from '@/components/mobile-tab-bar';
import { ToastProvider } from '@/components/ui/toast-provider';
import { fontMono, fontSans } from '@/config/fonts';
import { siteConfig } from '@/config/site';
import {
  getCachedNextUpdate,
  getCachedOpItems,
  getCachedSecrets
} from '@/lib/cached-data';
import { buildSecretRows, getSecretsBadge } from '@/lib/secret-status';
import { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Suspense } from 'react';
import { Providers } from '../components/providers';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`
  },
  description: siteConfig.description,
  icons: {
    icon: './favicon.ico',
    other: [
      {
        rel: 'mask-icon',
        color: 'black',
        url: './pinned-tab.svg'
      }
    ],
    shortcut: {
      url: './favicon.ico',
      type: 'image/x-icon'
    },
    apple: [
      {
        url: './apple-touch-icon-ipad-pro.png',
        rel: 'apple-touch-icon-precomposed',
        sizes: '167x167'
      },
      {
        url: './apple-touch-icon-ipad-2x.png',
        rel: 'apple-touch-icon-precomposed',
        sizes: '152x152'
      },
      {
        url: './apple-touch-icon-iphone-2x.png',
        rel: 'apple-touch-icon-precomposed',
        sizes: '120x120'
      },
      {
        url: './apple-touch-icon-ipad.png',
        rel: 'apple-touch-icon-precomposed',
        sizes: '76x76'
      },
      {
        url: './apple-touch-icon-iphone.png',
        rel: 'apple-touch-icon-precomposed',
        sizes: '60x60'
      },
      {
        url: './apple-touch-icon-iphone-3x.png',
        rel: 'apple-touch-icon-precomposed',
        sizes: '180x180'
      }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
};

async function I18nProvider({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  const locale = await getLocale();
  // oxlint-disable-next-line react/purity -- async server component, renders once per request
  const now = new Date();

  return (
    <NextIntlClientProvider messages={messages} now={now} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}

async function TopBar() {
  const nextUpdate = await getCachedNextUpdate();

  return <Menu nextUpdate={nextUpdate} />;
}

async function TabBar() {
  const [secrets, [items]] = await Promise.all([
    getCachedSecrets(),
    getCachedOpItems({ pagination: { page: 1, limit: 1000 } })
  ]);

  return (
    <MobileTabBar badge={getSecretsBadge(buildSecretRows(secrets, items))} />
  );
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // The font variables must sit on <html>: Tailwind resolves --font-sans at :root
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-screen font-sans antialiased">
        <Suspense fallback={null}>
          <I18nProvider>
            <Providers
              themeProps={{ attribute: 'data-theme', defaultTheme: 'dark' }}
            >
              <ToastProvider>
                <div className="flex min-h-screen flex-col pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">
                  <Suspense fallback={<Menu />}>
                    <TopBar />
                  </Suspense>
                  <main className="flex w-full flex-1 flex-col">
                    {children}
                  </main>
                  <Suspense fallback={<MobileTabBar />}>
                    <TabBar />
                  </Suspense>
                </div>
              </ToastProvider>
            </Providers>
          </I18nProvider>
        </Suspense>
      </body>
    </html>
  );
}
