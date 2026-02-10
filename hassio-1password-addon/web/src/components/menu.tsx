'use client';

import { siteConfig } from '@/config/site';
import { Avatar } from '@heroui/react';
import { GithubLogoIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { tv } from 'tailwind-variants';
import { LocaleSwitch } from './locale-switch';
import { ThemeSwitch } from './theme-switch';

const navLink = tv({
  base: 'text-default-500 hover:text-foreground hover:bg-default-100/50 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
  variants: {
    active: {
      true: 'bg-default-100 text-foreground dark:bg-default-200'
    }
  }
});

export const Menu = () => {
  const pathname = usePathname();
  const t = useTranslations('menu');

  return (
    <header className="bg-background/80 border-divider sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="container mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="./" className="flex items-center" prefetch={false}>
            <Image
              src="/logo.png"
              width={120}
              height={36}
              alt={siteConfig.name}
              className="dark:brightness-110"
            />
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              className={navLink({ active: pathname === '/' })}
              href="./"
              prefetch={false}
            >
              {t('secrets')}
            </Link>
            <Link
              prefetch={false}
              className={navLink({
                active: pathname.startsWith('/groups')
              })}
              href="./groups"
            >
              {t('groups')}
            </Link>
            <Link
              prefetch={false}
              className={navLink({
                active: pathname.startsWith('/rate-limits')
              })}
              href="./rate-limits"
            >
              {t('rateLimits')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/Borales/hassio-addons"
            target="_blank"
            title={t('github')}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors"
            prefetch={false}
          >
            <Avatar
              size="sm"
              title={t('github')}
              className="bg-primary-900 text-default-100"
              icon={<GithubLogoIcon size={18} weight="fill" />}
            />
          </Link>
          <LocaleSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
};
