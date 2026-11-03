import { Inter, JetBrains_Mono } from 'next/font/google';

// latin-ext covers Polish, cyrillic covers Ukrainian.
// next/font needs literal options here, so the list can't be shared.
export const fontSans = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-inter'
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-jetbrains-mono'
});
