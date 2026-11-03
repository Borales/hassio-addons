// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const theme = vi.hoisted(() => ({
  resolvedTheme: 'dark',
  setTheme: vi.fn()
}));

vi.mock('next-intl', () => import('../helpers/next-intl'));
vi.mock('next-themes', () => ({ useTheme: () => theme }));

import { ThemeMenuItem, ThemeSwitch } from '@/components/theme-switch';

describe('ThemeSwitch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    theme.resolvedTheme = 'dark';
  });

  it('offers light mode when dark', () => {
    render(<ThemeSwitch />);

    fireEvent.click(screen.getByRole('button', { name: 'switchToLight' }));

    expect(theme.setTheme).toHaveBeenCalledWith('light');
  });

  it('offers dark mode when light', () => {
    theme.resolvedTheme = 'light';
    render(<ThemeSwitch />);

    fireEvent.click(screen.getByRole('button', { name: 'switchToDark' }));

    expect(theme.setTheme).toHaveBeenCalledWith('dark');
  });

  it('renders the default on the server, whatever the theme is', () => {
    theme.resolvedTheme = 'light';
    expect(renderToString(<ThemeSwitch />)).toContain('switchToLight');
  });
});

describe('ThemeMenuItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    theme.resolvedTheme = 'dark';
  });

  it.each([
    ['dark', 'lightMode', 'light'],
    ['light', 'darkMode', 'dark']
  ])('in %s mode offers %s', (current, label, next) => {
    theme.resolvedTheme = current;
    render(<ThemeMenuItem />);

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(theme.setTheme).toHaveBeenCalledWith(next);
  });

  it('notifies the menu so it can close', () => {
    const onToggle = vi.fn();
    render(<ThemeMenuItem onToggle={onToggle} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledOnce();
  });
});
