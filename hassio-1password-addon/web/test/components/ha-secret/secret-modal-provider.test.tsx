// @vitest-environment happy-dom
vi.mock('@/components/ha-secret/secret-modal', () => ({}));

import { act, render, renderHook, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  SecretModalProvider,
  useSecretModal
} from '@/components/ha-secret/secret-modal-provider';

const wrapper = ({ children }: { children: ReactNode }) => (
  <SecretModalProvider>{children}</SecretModalProvider>
);

const mockSecret = { id: 'secret-1', name: 'My Secret' } as any;

describe('SecretModalProvider', () => {
  it('renders children', () => {
    render(
      <SecretModalProvider>
        <div data-testid="child">hello</div>
      </SecretModalProvider>
    );
    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('useSecretModal throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useSecretModal());
    }).toThrow('useSecretModal must be used within SecretModalProvider');
  });

  it('initial activeSecret is null', () => {
    const { result } = renderHook(() => useSecretModal(), { wrapper });
    expect(result.current.activeSecret).toBeNull();
  });

  it('openModal sets activeSecret to the provided secret', () => {
    const { result } = renderHook(() => useSecretModal(), { wrapper });

    act(() => {
      result.current.openModal(mockSecret);
    });

    expect(result.current.activeSecret).toBe(mockSecret);
  });

  it('closeModal resets activeSecret to null', () => {
    const { result } = renderHook(() => useSecretModal(), { wrapper });

    act(() => {
      result.current.openModal(mockSecret);
    });

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.activeSecret).toBeNull();
  });
});
