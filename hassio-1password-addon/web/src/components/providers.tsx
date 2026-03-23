'use client';

import { RouterProvider } from '@heroui/react';
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
    <NextThemesProvider {...themeProps}>
      <RouterProvider navigate={router.push}>{children}</RouterProvider>
    </NextThemesProvider>
  );
}
