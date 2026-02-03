import './globals.css';

import { Menu } from '@/components/menu';
import { fontSans } from '@/config/fonts';
import { siteConfig } from '@/config/site';
import { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Providers } from '../components/providers';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
    other: [
      {
        rel: 'mask-icon',
        color: 'black',
        url: '/pinned-tab.svg'
      }
    ],
    shortcut: {
      url: '/favicon.ico',
      type: 'image/x-icon'
    },
    apple: [
      {
        url: '/apple-touch-icon-ipad-pro.png',
        rel: 'apple-touch-icon-precomposed',
        sizes: '167x167'
      },
      {
        url: '/apple-touch-icon-ipad-2x.png',
        rel: 'apple-touch-icon-precomposed',
        sizes: '152x152'
      },
      {
        url: '/apple-touch-icon-iphone-2x.png',
        rel: 'apple-touch-icon-precomposed',
        sizes: '120x120'
      },
      {
        url: '/apple-touch-icon-ipad.png',
        rel: 'apple-touch-icon-precomposed',
        sizes: '76x76'
      },
      {
        url: '/apple-touch-icon-iphone.png',
        rel: 'apple-touch-icon-precomposed',
        sizes: '60x60'
      },
      {
        url: '/apple-touch-icon-iphone-3x.png',
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

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`bg-background min-h-screen font-sans antialiased ${fontSans.variable}`}
      >
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
          <div className="relative flex h-screen flex-col">
            <Menu />
            <main className="container mx-auto max-w-7xl grow p-6">
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
