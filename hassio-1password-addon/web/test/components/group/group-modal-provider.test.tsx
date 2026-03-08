// @vitest-environment happy-dom
import { act, render, renderHook, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import {
  GroupModalProvider,
  useGroupModal
} from '@/components/group/group-modal-provider';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GroupModalProvider>{children}</GroupModalProvider>
);

const mockGroup = {
  id: 'group-1',
  name: 'Test Group',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  secrets: []
};

describe('GroupModalProvider', () => {
  it('renders children', () => {
    render(
      <GroupModalProvider>
        <div data-testid="child">hello</div>
      </GroupModalProvider>
    );
    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('useGroupModal throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useGroupModal());
    }).toThrow('useGroupModal must be used within GroupModalProvider');
  });

  it('openCreateModal sets mode to create and activeGroup to null', () => {
    const { result } = renderHook(() => useGroupModal(), { wrapper });

    act(() => {
      result.current.openCreateModal();
    });

    expect(result.current.mode).toBe('create');
    expect(result.current.activeGroup).toBeNull();
  });

  it('openEditModal sets mode to edit and activeGroup to the provided group', () => {
    const { result } = renderHook(() => useGroupModal(), { wrapper });

    act(() => {
      result.current.openEditModal(mockGroup);
    });

    expect(result.current.mode).toBe('edit');
    expect(result.current.activeGroup).toBe(mockGroup);
  });

  it('closeModal resets mode to null and activeGroup to null', () => {
    const { result } = renderHook(() => useGroupModal(), { wrapper });

    act(() => {
      result.current.openCreateModal();
    });

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.mode).toBeNull();
    expect(result.current.activeGroup).toBeNull();
  });

  it('after openEditModal then closeModal, mode is null', () => {
    const { result } = renderHook(() => useGroupModal(), { wrapper });

    act(() => {
      result.current.openEditModal(mockGroup);
    });

    expect(result.current.mode).toBe('edit');

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.mode).toBeNull();
  });
});
