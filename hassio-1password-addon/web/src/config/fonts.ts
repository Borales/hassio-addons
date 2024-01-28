import { Fira_Code as FontMono, Roboto as FontSans } from 'next/font/google';

export const fontSans = FontSans({
  weight: ['100', '300', '400', '500', '700', '900'],
  preload: true,
  subsets: ['latin'],
  variable: '--font-sans'
});

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono'
});
