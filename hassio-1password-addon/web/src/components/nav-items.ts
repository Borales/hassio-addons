import {
  GaugeIcon,
  KeyIcon,
  QuestionIcon,
  SquaresFourIcon
} from '@phosphor-icons/react';

// Relative hrefs: the app is served from a Home Assistant ingress sub-path.
export const navItems = [
  {
    key: 'secrets',
    shortKey: 'secrets',
    href: './',
    icon: KeyIcon,
    isActive: (pathname: string) => pathname.endsWith('/')
  },
  {
    key: 'groups',
    shortKey: 'groups',
    href: './groups',
    icon: SquaresFourIcon,
    isActive: (pathname: string) => pathname.endsWith('/groups')
  },
  {
    key: 'rateLimits',
    shortKey: 'rateLimitsShort',
    href: './rate-limits',
    icon: GaugeIcon,
    isActive: (pathname: string) => pathname.endsWith('/rate-limits')
  },
  {
    key: 'help',
    shortKey: 'help',
    href: './help',
    icon: QuestionIcon,
    isActive: (pathname: string) => pathname.endsWith('/help')
  }
] as const;
