// @vitest-environment happy-dom
import { buildSecretRows } from '@/lib/secret-status';
import type { GroupWithSecrets } from '@/service/group.service';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGroup, makeItem } from '../../helpers/fixtures';
import { t } from '../../helpers/next-intl';

vi.mock('next-intl', () => import('../../helpers/next-intl'));
vi.mock('@/actions/group-create', () => ({ createGroup: vi.fn() }));
vi.mock('@/actions/group-update', () => ({ updateGroup: vi.fn() }));

import { createGroup } from '@/actions/group-create';
import { updateGroup } from '@/actions/group-update';
import {
  GroupModalProvider,
  useGroupModal
} from '@/components/group/group-modal-provider';
import { GroupModalWrapper } from '@/components/group/group-modal-wrapper';
import { ToastProvider } from '@/components/ui/toast-provider';

const SECRET_IDS = ['alpha_key', 'beta_key', 'gamma_other'];

const secrets = buildSecretRows(
  [
    {
      id: 'alpha_key',
      reference: 'op://Smart Home/Mi Home/password',
      itemId: 'item-1'
    },
    { id: 'beta_key' },
    { id: 'gamma_other' }
  ],
  [makeItem()]
);

const Opener = ({ group }: { group?: GroupWithSecrets }) => {
  const { openCreateModal, openEditModal } = useGroupModal();
  return (
    <button onClick={() => (group ? openEditModal(group) : openCreateModal())}>
      open-modal
    </button>
  );
};

const setup = (group?: GroupWithSecrets, groupNames = ['taken']) => {
  render(
    <ToastProvider>
      <GroupModalProvider>
        <Opener group={group} />
        <GroupModalWrapper secrets={secrets} groupNames={groupNames} />
      </GroupModalProvider>
    </ToastProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'open-modal' }));
};

const nameInput = () =>
  screen.getByRole<HTMLInputElement>('textbox', { name: 'nameLabel' });
const typeName = (value: string) =>
  fireEvent.change(nameInput(), { target: { value } });
const button = (name: string) =>
  screen.getByRole<HTMLButtonElement>('button', { name });
const checkbox = (id: string) =>
  screen
    .getByText(id)
    .closest('label')
    ?.querySelector<HTMLInputElement>('input') as HTMLInputElement;
const selected = () => SECRET_IDS.filter((id) => checkbox(id).checked);
const filter = (value: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: 'filterSecrets' }), {
    target: { value }
  });
const dialogText = () => screen.getByRole('dialog').textContent;

describe('GroupModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createGroup).mockResolvedValue({ success: true });
    vi.mocked(updateGroup).mockResolvedValue({ success: true });
  });

  describe('name', () => {
    it.each([
      ['My Service', 'my_service'],
      ['A  B', 'a_b'],
      ['UPPER', 'upper']
    ])('normalises %s to %s as you type', (typed, value) => {
      setup();
      typeName(typed);
      expect(nameInput().value).toBe(value);
    });

    it('stays quiet until touched', () => {
      setup();

      expect(screen.getByText('nameDescription')).toBeDefined();
      expect(nameInput().className).not.toContain('input-error');
      expect(nameInput().getAttribute('aria-invalid')).toBe('false');
    });

    it('requires a name once left empty', () => {
      setup();

      fireEvent.blur(nameInput());

      expect(screen.getByText('required')).toBeDefined();
      expect(nameInput().className).toContain('input-error');
      expect(nameInput().getAttribute('aria-invalid')).toBe('true');
    });

    it.each([
      ['bad!name', 'invalid'],
      ['x', 'tooShort'],
      ['x'.repeat(51), 'tooLong'],
      ['taken', 'duplicate']
    ])('rejects %s as %s', (name, error) => {
      setup();

      typeName(name);

      expect(screen.getByText(error)).toBeDefined();
      expect(nameInput().className).toContain('input-error');
    });

    it('clears the error once valid', () => {
      setup();

      typeName('bad!name');
      typeName('good_name');

      expect(screen.getByText('nameDescription')).toBeDefined();
      expect(nameInput().className).not.toContain('input-error');
    });

    it('accepts the name the group already has', () => {
      setup(makeGroup('taken', ['beta_key']));

      typeName('taken');

      expect(nameInput().className).not.toContain('input-error');
      expect(button('save').disabled).toBe(false);
    });
  });

  describe('submit button', () => {
    it('is disabled with no secret selected, saying why', () => {
      setup();
      typeName('valid');

      expect(button('createAction').disabled).toBe(true);
      expect(button('createAction').parentElement?.dataset.tip).toBe(
        'selectAtLeastOne'
      );
    });

    it('is disabled with an invalid name, saying why', () => {
      setup();
      fireEvent.click(checkbox('beta_key'));
      typeName('bad!name');

      expect(button('createAction').disabled).toBe(true);
      expect(button('createAction').parentElement?.dataset.tip).toBe('invalid');
    });

    it('is enabled with a valid name and a secret', () => {
      setup();
      typeName('valid');
      fireEvent.click(checkbox('beta_key'));

      expect(button('createAction').disabled).toBe(false);
    });
  });

  describe('secret selection', () => {
    it('toggles a secret', () => {
      setup();

      fireEvent.click(checkbox('beta_key'));
      expect(selected()).toEqual(['beta_key']);

      fireEvent.click(checkbox('beta_key'));
      expect(selected()).toEqual([]);
    });

    it('selects all without a filter', () => {
      setup();

      fireEvent.click(button('selectAll'));

      expect(selected()).toEqual(SECRET_IDS);
    });

    it('selects only the shown secrets with a filter, adding to the selection', () => {
      setup();
      fireEvent.click(checkbox('gamma_other'));

      filter('KEY');
      expect(screen.queryByText('gamma_other')).toBeNull();
      fireEvent.click(button('selectShown'));

      filter('');
      expect(selected()).toEqual(SECRET_IDS);
    });

    it('clears the selection, and only offers that when something is selected', () => {
      setup();
      expect(screen.queryByRole('button', { name: 'clear' })).toBeNull();

      fireEvent.click(button('selectAll'));
      fireEvent.click(button('clear'));

      expect(selected()).toEqual([]);
      expect(screen.queryByRole('button', { name: 'clear' })).toBeNull();
    });

    it('says when the filter matches nothing', () => {
      setup();

      filter('nope');

      expect(screen.getByText('noSecretsMatch')).toBeDefined();
      expect(t).toHaveBeenCalledWith('noSecretsMatch', { query: 'nope' });
    });

    it('does not submit when pressing Enter in the filter', () => {
      setup();

      const notPrevented = fireEvent.keyDown(
        screen.getByRole('textbox', { name: 'filterSecrets' }),
        { key: 'Enter' }
      );

      expect(notPrevented).toBe(false);
    });

    it('shows the item of assigned secrets and the status of the others', () => {
      setup();

      const row = (id: string) =>
        within(screen.getByText(id).closest('label') as HTMLElement);

      expect(row('alpha_key').getByText('Mi Home')).toBeDefined();
      expect(row('beta_key').getByText('status.unassigned')).toBeDefined();
    });
  });

  describe('event name', () => {
    it('shows the placeholder, with nothing to copy, until the name is valid', () => {
      setup();

      expect(dialogText()).toContain('onepassword_group_{name}_updated');
      expect(screen.queryByRole('button', { name: /^copyEvent/ })).toBeNull();

      typeName('bad!name');
      expect(dialogText()).toContain('onepassword_group_{name}_updated');
    });

    it('follows the name live, and can be copied', () => {
      setup();

      typeName('My Service');

      const event = 'onepassword_group_my_service_updated';
      expect(dialogText()).toContain(event);
      expect(button(`copyEvent: ${event}`)).toBeDefined();
    });
  });

  describe('creating', () => {
    const fillAndSubmit = () => {
      typeName('New Group');
      fireEvent.change(
        screen.getByRole('textbox', { name: 'descriptionLabel' }),
        { target: { value: 'Details' } }
      );
      fireEvent.click(checkbox('alpha_key'));
      fireEvent.click(checkbox('beta_key'));
      return act(async () => fireEvent.click(button('createAction')));
    };

    it('opens empty, titled for creation', () => {
      setup();

      expect(screen.getByRole('dialog', { name: 'createTitle' })).toBeDefined();
      expect(nameInput().value).toBe('');
      expect(selected()).toEqual([]);
    });

    it('focuses the name field', () => {
      setup();
      expect(document.activeElement).toBe(nameInput());
    });

    it('submits the form, toasts and closes', async () => {
      setup();

      await fillAndSubmit();

      const formData = vi.mocked(createGroup).mock.calls[0][0];
      expect(formData.get('name')).toBe('new_group');
      expect(formData.get('description')).toBe('Details');
      expect(formData.getAll('secretIds')).toEqual(['alpha_key', 'beta_key']);
      expect(formData.has('groupId')).toBe(false);
      expect(updateGroup).not.toHaveBeenCalled();

      expect(screen.getByRole('status').textContent).toContain('groupCreated');
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('keeps the dialog open and shows the error when it fails', async () => {
      vi.mocked(createGroup).mockResolvedValue({
        success: false,
        error: 'db is locked'
      });
      setup();

      await fillAndSubmit();

      expect(screen.getByRole('alert').textContent).toBe('db is locked');
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  describe('editing', () => {
    const group = makeGroup('xiaomi', ['beta_key'], {
      description: 'Devices'
    });

    it('opens with the group loaded', () => {
      setup(group);

      expect(screen.getByRole('dialog', { name: 'editTitle' })).toBeDefined();
      expect(nameInput().value).toBe('xiaomi');
      expect(
        screen.getByRole<HTMLTextAreaElement>('textbox', {
          name: 'descriptionLabel'
        }).value
      ).toBe('Devices');
      expect(selected()).toEqual(['beta_key']);
    });

    it('updates by id, toasts and closes', async () => {
      setup(group);

      await act(async () => fireEvent.click(button('save')));

      const formData = vi.mocked(updateGroup).mock.calls[0][0];
      expect(formData.get('groupId')).toBe(group.id);
      expect(formData.get('name')).toBe('xiaomi');
      expect(createGroup).not.toHaveBeenCalled();

      expect(screen.getByRole('status').textContent).toContain('groupSaved');
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('cancel closes without saving', () => {
    setup();

    fireEvent.click(button('cancel'));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(createGroup).not.toHaveBeenCalled();
  });
});
