'use client';

import type { SecretsBadge } from '@/lib/secret-status';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './nav-items';

export const MobileTabBar = ({ badge }: { badge?: SecretsBadge }) => {
  const pathname = usePathname();
  const t = useTranslations('menu');

  return (
    <nav
      className="hairline fixed inset-x-0 bottom-0 z-30 flex border-t bg-[color-mix(in_oklab,var(--color-base-100)_92%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label={t('main')}
    >
      {navItems.map(({ key, shortKey, href, icon: Icon, isActive }) => {
        const active = isActive(pathname);
        return (
          <Link
            key={key}
            href={href}
            prefetch={false}
            aria-current={active ? 'page' : undefined}
            className={`flex h-14 flex-1 flex-col items-center justify-center gap-1 transition-colors ${active ? 'text-primary' : 'text-muted'}`}
          >
            <span className="relative">
              <Icon size={19} />
              {key === 'secrets' && badge && (
                <span
                  className={`ring-base-100 absolute -top-1 -right-2 size-2 rounded-full ring-2 ${badge === 'error' ? 'bg-error' : 'bg-warning'}`}
                />
              )}
            </span>
            <span className="text-[11px] font-medium">{t(shortKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
};
