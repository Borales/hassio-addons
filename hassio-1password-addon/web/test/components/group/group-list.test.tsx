// @vitest-environment happy-dom
import { buildSecretRows } from '@/lib/secret-status';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGroup } from '../../helpers/fixtures';
import { t } from '../../helpers/next-intl';

vi.mock('next-intl', () => import('../../helpers/next-intl'));
vi.mock('@/actions/group-create', () => ({ createGroup: vi.fn() }));
vi.mock('@/actions/group-delete', () => ({ deleteGroup: vi.fn() }));

import { createGroup } from '@/actions/group-create';
import { deleteGroup } from '@/actions/group-delete';
import { GroupList } from '@/components/group/group-list';
import {
  GroupModalProvider,
  useGroupModal
} from '@/components/group/group-modal-provider';
import { ToastProvider } from '@/components/ui/toast-provider';

const xiaomi = makeGroup('xiaomi', ['free_key', 'missing_key'], {
  description: 'Devices'
});
const empty = makeGroup('empty_group');

const secrets = buildSecretRows([{ id: 'free_key' }], []);

const ModalProbe = () => {
  const { mode, activeGroup } = useGroupModal();
  return (
    <output>
      {mode ?? 'closed'}:{activeGroup?.name}
    </output>
  );
};

const setup = (groups = [xiaomi, empty]) =>
  render(
    <ToastProvider>
      <GroupModalProvider>
        <GroupList groups={groups} secrets={secrets} />
        <ModalProbe />
      </GroupModalProvider>
    </ToastProvider>
  );

const table = () => within(screen.getByRole('table'));
const row = (name: string) =>
  table().getByRole('button', { name }).closest('tr') as HTMLElement;

/** Opens the delete confirmation of the group's row in the table. */
const askToDelete = (name: string) =>
  fireEvent.click(
    within(row(name)).getByRole('button', { name: 'actions.deleteAria' })
  );

const confirmDelete = () =>
  act(async () =>
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'delete'
      })
    )
  );

describe('GroupList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deleteGroup).mockResolvedValue({ success: true });
    vi.mocked(createGroup).mockResolvedValue({ success: true });
  });

  it('renders each group in both the desktop table and the phone list', () => {
    setup([xiaomi]);

    expect(table().getByRole('button', { name: 'xiaomi' })).toBeDefined();
    expect(
      within(screen.getByRole('list', { name: 'title' })).getByRole('listitem')
        .textContent
    ).toContain('xiaomi');
  });

  it('shows the description, event name and how many groups there are', () => {
    const { container } = setup();

    const cells = within(row('xiaomi'));
    expect(cells.getByText('Devices')).toBeDefined();
    expect(row('xiaomi').textContent).toContain(
      'onepassword_group_xiaomi_updated'
    );
    expect(
      cells.getByRole('button', {
        name: 'copyEvent: onepassword_group_xiaomi_updated'
      })
    ).toBeDefined();
    expect(t).toHaveBeenCalledWith('groupCount', { count: 2 });
    expect(container.textContent).toContain('2 groupCount');
  });

  it('shows a placeholder for a group without secrets', () => {
    setup();
    expect(within(row('empty_group')).getByText('noSecrets')).toBeDefined();
  });

  it('shows linked secrets with their status, treating unknown ones as hidden', () => {
    setup();

    const chip = (id: string) => within(row('xiaomi')).getByText(id);
    expect(chip('free_key').querySelector('.dot-unassigned')).not.toBeNull();
    expect(chip('missing_key').querySelector('.dot-hidden')).not.toBeNull();
  });

  it('folds secrets beyond the third into an overflow chip', () => {
    setup([makeGroup('many', ['a', 'b', 'c', 'd', 'e'])]);

    expect(within(row('many')).queryByText('d')).toBeNull();
    expect(within(row('many')).getByText('moreSecrets')).toBeDefined();
    expect(t).toHaveBeenCalledWith('moreSecrets', { count: 2 });
  });

  it.each([
    ['the name', 'xiaomi'],
    ['the edit button', 'actions.editAria']
  ])('opens the edit modal from %s', (_from, name) => {
    setup();

    fireEvent.click(within(row('xiaomi')).getByRole('button', { name }));

    expect(screen.getByRole('status').textContent).toBe('edit:xiaomi');
  });

  describe('deleting', () => {
    it('asks first', () => {
      setup();

      askToDelete('xiaomi');

      expect(
        screen.getByRole('dialog', { name: 'delete.title' }).textContent
      ).toContain('onepassword_group_xiaomi_updated');
      expect(t).toHaveBeenCalledWith('delete.title', { name: 'xiaomi' });
      expect(deleteGroup).not.toHaveBeenCalled();
    });

    it('does nothing when cancelled', () => {
      setup();
      askToDelete('xiaomi');

      fireEvent.click(screen.getByRole('button', { name: 'cancel' }));

      expect(screen.queryByRole('dialog')).toBeNull();
      expect(deleteGroup).not.toHaveBeenCalled();
    });

    it('deletes by id once confirmed, and offers undo', async () => {
      setup();
      askToDelete('xiaomi');

      await confirmDelete();

      expect(vi.mocked(deleteGroup).mock.calls[0][0].get('groupId')).toBe(
        xiaomi.id
      );
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(
        screen
          .getAllByRole('status')
          .some(({ textContent }) => textContent?.includes('groupDeleted'))
      ).toBe(true);
      expect(createGroup).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'undo' })).toBeDefined();
    });

    it('shows an error when the undo fails', async () => {
      setup();
      askToDelete('xiaomi');
      await confirmDelete();
      vi.mocked(createGroup).mockResolvedValue({ success: false });

      await act(async () =>
        fireEvent.click(screen.getByRole('button', { name: 'undo' }))
      );

      expect(screen.getByText('undoFailed')).toBeDefined();
    });

    it('undo recreates the group with the same name, description and secrets', async () => {
      setup();
      askToDelete('xiaomi');
      await confirmDelete();

      await act(async () =>
        fireEvent.click(screen.getByRole('button', { name: 'undo' }))
      );

      const formData = vi.mocked(createGroup).mock.calls[0][0];
      expect(formData.get('name')).toBe('xiaomi');
      expect(formData.get('description')).toBe('Devices');
      expect(formData.getAll('secretIds')).toEqual(['free_key', 'missing_key']);
    });

    it('undo sends an empty description when the group had none', async () => {
      setup();
      askToDelete('empty_group');
      await confirmDelete();

      await act(async () =>
        fireEvent.click(screen.getByRole('button', { name: 'undo' }))
      );

      const formData = vi.mocked(createGroup).mock.calls[0][0];
      expect(formData.get('description')).toBe('');
      expect(formData.getAll('secretIds')).toEqual([]);
    });

    it.each([
      ['the error', 'locked', 'locked'],
      ['a fallback', undefined, 'deleteGroupFailed']
    ])('shows %s with no undo when it fails', async (_case, error, text) => {
      vi.mocked(deleteGroup).mockResolvedValue({ success: false, error });
      setup();
      askToDelete('xiaomi');

      await confirmDelete();

      expect(
        screen
          .getAllByRole('status')
          .some(({ textContent }) => textContent === text)
      ).toBe(true);
      expect(screen.queryByRole('button', { name: 'undo' })).toBeNull();
    });
  });
});
