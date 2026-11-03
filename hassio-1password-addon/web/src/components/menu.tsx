'use client';

import { siteConfig } from '@/config/site';
import {
  ArrowSquareOutIcon,
  DotsThreeIcon,
  GithubLogoIcon
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LocaleSelect, LocaleSwitch } from './locale-switch';
import { navItems } from './nav-items';
import { MobileSyncPill } from './sync/mobile-sync-pill';
import { ThemeMenuItem, ThemeSwitch } from './theme-switch';

type MenuProps = {
  /** Next scheduled sync; `undefined` until the status has loaded. */
  nextUpdate?: string | null;
};

const closeDropdown = () => (document.activeElement as HTMLElement)?.blur();

const MobileMoreMenu = () => {
  const t = useTranslations('menu');

  return (
    <div className="dropdown dropdown-end md:hidden">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm btn-square"
        aria-label={t('more')}
      >
        <DotsThreeIcon size={18} />
      </div>
      <div
        tabIndex={0}
        className="dropdown-content bg-base-200 rounded-box hairline z-30 mt-1 w-64 border p-1.5 shadow-xl"
      >
        <ul className="menu menu-sm w-full p-0">
          <li>
            <ThemeMenuItem onToggle={closeDropdown} />
          </li>
          <li>
            <a
              href={siteConfig.repo}
              target="_blank"
              rel="noreferrer"
              className="py-2.5"
            >
              <GithubLogoIcon size={16} />
              {t('githubShort')}
              <ArrowSquareOutIcon size={12} className="text-muted ml-auto" />
            </a>
          </li>
        </ul>
        <LocaleSelect />
      </div>
    </div>
  );
};

export const Menu = ({ nextUpdate }: MenuProps) => {
  const pathname = usePathname();
  const t = useTranslations('menu');

  return (
    <header className="hairline sticky top-0 z-30 border-b bg-[color-mix(in_oklab,var(--color-base-100)_86%,transparent)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-8">
        <Link
          href="./"
          prefetch={false}
          className="flex shrink-0 items-center gap-2.5"
          aria-label={`${siteConfig.name}, version ${siteConfig.version}`}
        >
          <Image
            src="/logo.png"
            width={250}
            height={74}
            sizes="81px"
            alt="1Password"
            className="brand-logo"
            style={{ width: 'auto' }}
            loading="eager"
          />
          <span className="text-muted translate-y-px font-mono text-[11px]">
            v{siteConfig.version}
          </span>
        </Link>

        <nav
          className="pill-nav ml-5 hidden items-center gap-0.5 md:flex"
          aria-label={t('main')}
        >
          {navItems.map(({ key, href, icon: Icon, isActive }) => (
            <Link
              key={key}
              href={href}
              prefetch={false}
              aria-current={isActive(pathname) ? 'page' : undefined}
              className="rounded-field flex items-center gap-1.5 px-3 py-1.5 text-[13px] whitespace-nowrap transition"
            >
              <Icon size={14} />
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {nextUpdate !== undefined && (
            <MobileSyncPill nextUpdate={nextUpdate} />
          )}
          <MobileMoreMenu />

          <div className="hidden items-center gap-0.5 md:flex">
            <LocaleSwitch />
            <span
              className="tooltip tooltip-bottom"
              data-tip={t('githubShort')}
            >
              <a
                href={siteConfig.repo}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm btn-square"
                aria-label={t('github')}
              >
                <GithubLogoIcon size={16} />
              </a>
            </span>
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </header>
  );
};
