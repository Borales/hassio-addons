// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { beforeEach, describe, expect, it } from 'vitest';

import { Providers } from '@/components/providers';

const ThemeProbe = () => <p>theme: {useTheme().theme}</p>;

describe('Providers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('gives its children the theme context, configured by themeProps', () => {
    render(
      <Providers themeProps={{ defaultTheme: 'dark', enableSystem: false }}>
        <ThemeProbe />
      </Providers>
    );

    expect(screen.getByText('theme: dark')).toBeDefined();
  });

  it('works without themeProps', () => {
    render(
      <Providers>
        <p>child</p>
      </Providers>
    );

    expect(screen.getByText('child')).toBeDefined();
  });
});
