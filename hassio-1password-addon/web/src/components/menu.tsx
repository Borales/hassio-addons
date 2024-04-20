'use client';

import { siteConfig } from '@/config/site';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { tv } from 'tailwind-variants';
import { ThemeSwitch } from './theme-switch';

const variants = tv({
  base: '',
  variants: {
    active: {
      '/': {
        home: 'font-bold text-primary',
        op: ''
      },
      '/op': {
        home: '',
        op: 'font-bold text-primary'
      }
    }
  },
  slots: { home: '', op: '' }
});

export const Menu = () => {
  const pathname = usePathname();
  const { home, op } = variants({ active: pathname as any });

  return (
    <header className="bg-background shadow-small">
      <div className="container mx-auto flex max-w-7xl justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold">
            <Image
              src="/logo.png"
              width={150}
              height={45}
              alt={siteConfig.name}
              className="drop-shadow-md filter"
            />
          </Link>
          <Link className={home()} href="/">
            HA Secrets
          </Link>
          <Link className={op()} href="/op">
            1Password
          </Link>
        </div>
        <ThemeSwitch />
      </div>
    </header>
  );
};
