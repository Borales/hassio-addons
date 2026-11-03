// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeGroup } from '../../helpers/fixtures';

vi.mock('@/components/group/group-modal', () => ({
  GroupModal: ({
    group,
    isNew,
    groupNames
  }: {
    group: { name: string } | null;
    isNew: boolean;
    groupNames: string[];
  }) => (
    <div role="dialog">
      {group?.name ?? 'no-group'}|{isNew ? 'new' : 'existing'}|
      {groupNames.join(',')}
    </div>
  )
}));

import {
  GroupModalProvider,
  useGroupModal
} from '@/components/group/group-modal-provider';
import { GroupModalWrapper } from '@/components/group/group-modal-wrapper';

const Controls = () => {
  const { openCreateModal, openEditModal, closeModal } = useGroupModal();
  return (
    <>
      <button onClick={openCreateModal}>create</button>
      <button onClick={() => openEditModal(makeGroup('xiaomi'))}>edit</button>
      <button onClick={closeModal}>close</button>
    </>
  );
};

const click = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }));

describe('GroupModalWrapper', () => {
  const setup = () =>
    render(
      <GroupModalProvider>
        <Controls />
        <GroupModalWrapper secrets={[]} groupNames={['a', 'b']} />
      </GroupModalProvider>
    );

  it('renders nothing while closed', () => {
    setup();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens an empty modal in create mode', () => {
    setup();
    click('create');
    expect(screen.getByRole('dialog').textContent).toBe('no-group|new|a,b');
  });

  it('opens the active group in edit mode', () => {
    setup();
    click('edit');
    expect(screen.getByRole('dialog').textContent).toBe('xiaomi|existing|a,b');
  });

  it('unmounts on close', () => {
    setup();
    click('create');
    click('close');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
