// @vitest-environment happy-dom
import { buildSecretRows } from '@/lib/secret-status';
import { act, render, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  SecretModalProvider,
  useSecretModal
} from '@/components/ha-secret/secret-modal-provider';

describe('SecretModalProvider', () => {
  it('holds the active secret between opening and closing', () => {
    const [row] = buildSecretRows([{ id: 'my_key' }], []);
    const { result } = renderHook(() => useSecretModal(), {
      wrapper: SecretModalProvider
    });
    expect(result.current.activeSecret).toBeNull();

    act(() => result.current.openModal(row));
    expect(result.current.activeSecret).toBe(row);

    act(() => result.current.closeModal());
    expect(result.current.activeSecret).toBeNull();
  });
});

describe('useSecretModal', () => {
  it('throws outside the provider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const Consumer = () => {
      useSecretModal();
      return null;
    };

    expect(() => render(<Consumer />)).toThrow(
      'useSecretModal must be used within SecretModalProvider'
    );

    consoleError.mockRestore();
  });
});
