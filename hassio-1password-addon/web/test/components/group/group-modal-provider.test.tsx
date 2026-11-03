// @vitest-environment happy-dom
import { act, render, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeGroup } from '../../helpers/fixtures';

import {
  GroupModalProvider,
  useGroupModal
} from '@/components/group/group-modal-provider';

const setup = () =>
  renderHook(() => useGroupModal(), { wrapper: GroupModalProvider }).result;

describe('GroupModalProvider', () => {
  it('starts closed', () => {
    const modal = setup();

    expect(modal.current.mode).toBeNull();
    expect(modal.current.activeGroup).toBeNull();
  });

  it('opens for a new group', () => {
    const modal = setup();

    act(() => modal.current.openCreateModal());

    expect(modal.current.mode).toBe('create');
    expect(modal.current.activeGroup).toBeNull();
  });

  it('opens for an existing group', () => {
    const modal = setup();
    const group = makeGroup('xiaomi');

    act(() => modal.current.openEditModal(group));

    expect(modal.current.mode).toBe('edit');
    expect(modal.current.activeGroup).toBe(group);
  });

  it('forgets the group when switching to create or closing', () => {
    const modal = setup();

    act(() => modal.current.openEditModal(makeGroup('xiaomi')));
    act(() => modal.current.openCreateModal());
    expect(modal.current.activeGroup).toBeNull();

    act(() => modal.current.openEditModal(makeGroup('xiaomi')));
    act(() => modal.current.closeModal());
    expect(modal.current.mode).toBeNull();
    expect(modal.current.activeGroup).toBeNull();
  });
});

describe('useGroupModal', () => {
  it('throws outside the provider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const Consumer = () => {
      useGroupModal();
      return null;
    };

    expect(() => render(<Consumer />)).toThrow(
      'useGroupModal must be used within GroupModalProvider'
    );

    consoleError.mockRestore();
  });
});
