'use client';

import { HeroUIProvider } from '@heroui/react';
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps
} from 'next-themes';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export interface ProvidersProps {
  children: ReactNode;
  themeProps?: Omit<ThemeProviderProps, 'children'>;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </HeroUIProvider>
  );
}
