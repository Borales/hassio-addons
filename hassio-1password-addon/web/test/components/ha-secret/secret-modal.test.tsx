// @vitest-environment happy-dom
import { buildSecretRows } from '@/lib/secret-status';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deferred, makeField, makeItem } from '../../helpers/fixtures';
import { t } from '../../helpers/next-intl';

vi.mock('next-intl', () => import('../../helpers/next-intl'));
vi.mock('@/actions/assign-secret', () => ({ assignSecret: vi.fn() }));
vi.mock('@/actions/refresh-op-secret', () => ({
  fetchOpItemFields: vi.fn()
}));

import { assignSecret } from '@/actions/assign-secret';
import { fetchOpItemFields } from '@/actions/refresh-op-secret';
import type { ModalItem } from '@/components/ha-secret/secret-modal';
import {
  SecretModalProvider,
  useSecretModal
} from '@/components/ha-secret/secret-modal-provider';
import { SecretModalWrapper } from '@/components/ha-secret/secret-modal-wrapper';
import { ToastProvider } from '@/components/ui/toast-provider';

const password = makeField('password');
const username = makeField('username', { type: 'STRING', value: 'octocat' });
const otp = makeField('one-time', { type: 'OTP', value: '123456' });

const miHome = makeItem({ fields: [password, username] });
const github = makeItem({
  id: 'item-2',
  title: 'GitHub',
  additionalInfo: 'octocat',
  vaultId: 'vault-2',
  vault: { name: 'Work' },
  fields: []
});
const router = makeItem({
  id: 'item-3',
  title: 'Router',
  additionalInfo: null,
  fields: []
});
const opItems = [miHome, github, router];

const rowFor = (secret: { reference?: string; itemId?: string }) =>
  buildSecretRows([{ id: 'my_key', ...secret }], opItems)[0];

const unassigned = rowFor({});
const assigned = rowFor({
  reference: password.reference!,
  itemId: miHome.id
});
const brokenField = rowFor({
  reference: 'op://Smart Home/Mi Home/gone',
  itemId: miHome.id
});
const brokenItem = rowFor({ reference: 'op://Smart Home/Deleted/password' });
const brokenVault = rowFor({ reference: 'op://Gone/Deleted/password' });
// Renamed in 1Password: the item still exists, so the FK keeps itemId
const renamedItem = rowFor({
  reference: 'op://Smart Home/Old Name/password',
  itemId: miHome.id
});

const fieldsLoaded = (fields: ModalItem['fields']) => ({
  success: true,
  item: { fields, urls: [] }
});

const Opener = ({ row }: { row: typeof unassigned }) => {
  const { openModal } = useSecretModal();
  return <button onClick={() => openModal(row)}>open-modal</button>;
};

/** Opens the modal for the row and lets the initial fields request finish. */
const setup = async (row: typeof unassigned, items = opItems) => {
  render(
    <ToastProvider>
      <SecretModalProvider>
        <Opener row={row} />
        <SecretModalWrapper opItems={items} />
      </SecretModalProvider>
    </ToastProvider>
  );
  await act(async () =>
    fireEvent.click(screen.getByRole('button', { name: 'open-modal' }))
  );
};

const search = () => screen.getByRole<HTMLInputElement>('combobox');
const options = () => screen.getAllByRole('option');
const activeOption = () =>
  options().find((option) => option.getAttribute('aria-selected') === 'true');
const press = (key: string) =>
  act(async () => fireEvent.keyDown(search(), { key }));
const typeQuery = (value: string) =>
  fireEvent.change(search(), { target: { value } });
const pick = (title: string) =>
  act(async () =>
    fireEvent.click(
      screen.getByText(title).closest('[role="option"]') as HTMLElement
    )
  );
const radio = (label: string) =>
  screen
    .getByText(label)
    .closest('label')
    ?.querySelector('input') as HTMLInputElement;
const save = (name: string) =>
  screen.getByRole<HTMLButtonElement>('button', { name });
const preview = () => screen.queryByText('preview')?.closest('section');

describe('HASecretModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assignSecret).mockResolvedValue({ success: true });
    vi.mocked(fetchOpItemFields).mockResolvedValue(
      fieldsLoaded([password, username])
    );
  });

  describe('title and button label', () => {
    it.each([
      ['assign', unassigned, 'assignTitle', 'assign'],
      ['change', assigned, 'changeTitle', 'save'],
      ['re-link', brokenField, 'relinkTitle', 'relink']
    ])('for %s', async (_mode, row, title, label) => {
      await setup(row);

      expect(screen.getByRole('dialog', { name: title })).toBeDefined();
      expect(save(label)).toBeDefined();
    });
  });

  describe('opening', () => {
    it('opens on search when unassigned, without loading anything', async () => {
      await setup(unassigned);

      expect(search()).toBeDefined();
      expect(options()).toHaveLength(opItems.length);
      expect(fetchOpItemFields).not.toHaveBeenCalled();
    });

    it('shows the current item and field when assigned', async () => {
      await setup(assigned);

      expect(screen.queryByRole('combobox')).toBeNull();
      expect(screen.getByText('Mi Home')).toBeDefined();
      expect(radio('password').checked).toBe(true);
    });

    it('focuses the search', async () => {
      await setup(unassigned);
      expect(document.activeElement).toBe(search());
    });
  });

  describe('broken links', () => {
    it('keeps the item selected when only the field is gone', async () => {
      await setup(brokenField);

      const itemStep = screen.getByRole('heading', { name: 'item' });
      expect(screen.queryByRole('combobox')).toBeNull();
      expect(itemStep.closest('section')?.textContent).toContain('Mi Home');
      expect(fetchOpItemFields).toHaveBeenCalledWith(miHome.id, miHome.vaultId);
      expect(radio('password').checked).toBe(false);
      expect(save('relink').disabled).toBe(true);
    });

    it('auto-selects the only usable field', async () => {
      vi.mocked(fetchOpItemFields).mockResolvedValue(fieldsLoaded([password]));

      await setup(brokenField);

      expect(radio('password').checked).toBe(true);
      expect(save('relink').disabled).toBe(false);
    });

    it.each([
      ['item', brokenItem],
      ['vault', brokenVault],
      ['old item path', renamedItem]
    ])('opens on search when the %s is gone', async (_cause, row) => {
      await setup(row);

      expect(search()).toBeDefined();
      expect(fetchOpItemFields).not.toHaveBeenCalled();
    });

    it.each([
      ['field', brokenField, '.iref-stale-field'],
      ['item', brokenItem, '.iref-stale-item']
    ])('explains a missing %s and strikes it', async (cause, row, stale) => {
      await setup(row);

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(`short.${cause}.`)).toBeDefined();
      expect(within(dialog).getByText('was')).toBeDefined();
      expect(dialog.querySelector(stale)).not.toBeNull();
    });

    it('strikes nothing when the whole vault is gone', async () => {
      await setup(brokenVault);

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('short.vault.')).toBeDefined();
      expect(dialog.querySelector('[class*="iref-stale"]')).toBeNull();
    });

    it('explains nothing for a healthy link', async () => {
      await setup(assigned);
      expect(screen.queryByText('was')).toBeNull();
    });
  });

  describe('loading fields', () => {
    it('shows a skeleton until the fields arrive', async () => {
      const pending = deferred<ReturnType<typeof fieldsLoaded>>();
      vi.mocked(fetchOpItemFields).mockReturnValue(pending.promise);

      await setup(unassigned);
      await pick('GitHub');

      expect(fetchOpItemFields).toHaveBeenCalledWith(github.id, github.vaultId);
      expect(
        screen.getByLabelText('loadingItems').getAttribute('aria-busy')
      ).toBe('true');
      expect(screen.queryByRole('radiogroup')).toBeNull();
      expect(preview()).toBeUndefined();

      await act(async () =>
        pending.resolve(fieldsLoaded([password, username]))
      );

      expect(screen.queryByLabelText('loadingItems')).toBeNull();
      expect(screen.getByRole('radiogroup')).toBeDefined();
    });

    it('skips the request for an item without a vault', async () => {
      const local = makeItem({
        id: 'item-4',
        title: 'Local',
        vaultId: null,
        vault: null,
        fields: [password]
      });

      await setup(unassigned, [local]);
      await pick('Local');

      expect(fetchOpItemFields).not.toHaveBeenCalled();
      expect(radio('password').checked).toBe(true);
    });

    it('selects nothing when several fields are usable', async () => {
      await setup(unassigned);
      await pick('GitHub');

      expect(radio('password').checked).toBe(false);
      expect(radio('username').checked).toBe(false);
      expect(save('assign').disabled).toBe(true);
    });

    it('auto-selects a single usable field, hiding OTP with a note', async () => {
      vi.mocked(fetchOpItemFields).mockResolvedValue(
        fieldsLoaded([otp, password])
      );

      await setup(unassigned);
      await pick('GitHub');

      expect(radio('password').checked).toBe(true);
      expect(screen.getAllByRole('radio')).toHaveLength(1);
      expect(screen.queryByText('one-time')).toBeNull();
      expect(screen.getByText('otpHidden')).toBeDefined();
      expect(save('assign').disabled).toBe(false);
    });

    it('does not auto-select over the current field when changing', async () => {
      vi.mocked(fetchOpItemFields).mockResolvedValue(fieldsLoaded([username]));
      const row = rowFor({ reference: password.reference!, itemId: miHome.id });

      await setup(row);

      expect(radio('username').checked).toBe(false);
    });

    it('ignores the response when the item was changed in the meantime', async () => {
      const pending = deferred<ReturnType<typeof fieldsLoaded>>();
      vi.mocked(fetchOpItemFields).mockReturnValue(pending.promise);
      await setup(unassigned);
      await pick('GitHub');

      fireEvent.click(screen.getByRole('button', { name: 'changeItem' }));
      await act(async () => pending.resolve(fieldsLoaded([password])));

      expect(search()).toBeDefined();
      expect(screen.queryByRole('radiogroup')).toBeNull();
    });

    it('only uses the response of the latest pick', async () => {
      const first = deferred<ReturnType<typeof fieldsLoaded>>();
      const second = deferred<ReturnType<typeof fieldsLoaded>>();
      vi.mocked(fetchOpItemFields)
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise);
      await setup(unassigned);

      await pick('GitHub');
      fireEvent.click(screen.getByRole('button', { name: 'changeItem' }));
      await pick('Router');
      await act(async () => second.resolve(fieldsLoaded([username])));
      await act(async () => first.resolve(fieldsLoaded([password])));

      expect(screen.getByText('username')).toBeDefined();
      expect(screen.queryByText('password')).toBeNull();
    });

    describe('when the request fails', () => {
      const consoleError = vi.spyOn(console, 'error');

      beforeEach(() => {
        consoleError.mockImplementation(() => {});
      });

      afterEach(() => {
        consoleError.mockReset();
      });

      it('falls back to the fields it has, after a rejection', async () => {
        vi.mocked(fetchOpItemFields).mockRejectedValue(new Error('offline'));

        await setup(unassigned);
        await pick('GitHub');

        expect(screen.queryByLabelText('loadingItems')).toBeNull();
        expect(screen.getByText('fieldItemPlaceholder')).toBeDefined();
      });

      it('falls back to the fields it has, after an error result', async () => {
        vi.mocked(fetchOpItemFields).mockResolvedValue({
          success: false,
          error: 'nope'
        });

        await setup(unassigned);
        await pick('GitHub');

        expect(screen.getByText('fieldItemPlaceholder')).toBeDefined();
      });
    });
  });

  describe('saving', () => {
    it('is disabled until the selection changes', async () => {
      await setup(assigned);
      expect(save('save').disabled).toBe(true);

      fireEvent.click(radio('username'));
      expect(save('save').disabled).toBe(false);

      fireEvent.click(radio('password'));
      expect(save('save').disabled).toBe(true);
    });

    it('is disabled again after going back to the search', async () => {
      await setup(assigned);
      fireEvent.click(radio('username'));

      fireEvent.click(screen.getByRole('button', { name: 'changeItem' }));

      expect(search()).toBeDefined();
      expect(save('save').disabled).toBe(true);
    });

    it('sends the secret, item and field', async () => {
      await setup(unassigned);
      await pick('GitHub');
      fireEvent.click(radio('username'));

      await act(async () => fireEvent.click(save('assign')));

      expect(
        Object.fromEntries(vi.mocked(assignSecret).mock.calls[0][0])
      ).toEqual({
        haSecretId: 'my_key',
        opSecretId: github.id,
        ref: username.reference
      });
    });

    it.each([
      ['assigned', unassigned, 'assign'],
      ['updated', assigned, 'save'],
      ['relinked', brokenField, 'relink']
    ])('toasts "%s" and closes', async (toast, row, label) => {
      await setup(row);
      if (row === unassigned) await pick('GitHub');
      fireEvent.click(radio('username'));

      await act(async () => fireEvent.click(save(label)));

      expect(screen.getByRole('status').textContent).toContain(toast);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('stays open and shows the error when it fails', async () => {
      vi.mocked(assignSecret).mockResolvedValue({
        success: false,
        error: 'locked'
      });
      await setup(assigned);
      fireEvent.click(radio('username'));

      await act(async () => fireEvent.click(save('save')));

      expect(screen.getByRole('alert').textContent).toBe('locked');
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.queryByRole('status')).toBeNull();
    });

    it('cancel closes without saving', async () => {
      await setup(assigned);

      fireEvent.click(screen.getByRole('button', { name: 'cancel' }));

      expect(screen.queryByRole('dialog')).toBeNull();
      expect(assignSecret).not.toHaveBeenCalled();
    });
  });

  describe('preview', () => {
    it('shows the masked value of the selected field', async () => {
      await setup(assigned);

      const section = within(preview() as HTMLElement);
      expect(section.getByText('my_key:')).toBeDefined();
      expect(section.getByText('********')).toBeDefined();
      expect(preview()?.textContent).not.toContain('op://');
    });

    it('follows the selection', async () => {
      await setup(assigned);

      fireEvent.click(radio('username'));

      expect(
        within(preview() as HTMLElement).getByText('octocat')
      ).toBeDefined();
    });

    it('is left out with no field selected', async () => {
      await setup(unassigned);
      await pick('GitHub');

      expect(preview()).toBeUndefined();
    });
  });

  describe('item search', () => {
    it('starts on the first result', async () => {
      await setup(unassigned);

      expect(activeOption()?.textContent).toContain('Mi Home');
      expect(search().getAttribute('aria-activedescendant')).toBe(
        activeOption()?.id
      );
    });

    it('moves with the arrow keys, stopping at both ends', async () => {
      await setup(unassigned);

      await press('ArrowUp');
      expect(activeOption()?.textContent).toContain('Mi Home');

      await press('ArrowDown');
      expect(activeOption()?.textContent).toContain('GitHub');
      expect(search().getAttribute('aria-activedescendant')).toBe(
        activeOption()?.id
      );

      await press('ArrowDown');
      await press('ArrowDown');
      expect(activeOption()?.textContent).toContain('Router');

      await press('ArrowUp');
      expect(activeOption()?.textContent).toContain('GitHub');
    });

    it('follows the mouse', async () => {
      await setup(unassigned);

      fireEvent.mouseMove(options()[2]);

      expect(activeOption()?.textContent).toContain('Router');
    });

    it('Enter picks the active result', async () => {
      await setup(unassigned);
      await press('ArrowDown');

      await press('Enter');

      expect(fetchOpItemFields).toHaveBeenCalledWith(github.id, github.vaultId);
      expect(screen.queryByRole('combobox')).toBeNull();
      expect(screen.getByText('GitHub')).toBeDefined();
    });

    it('matches the title, extra info and vault, ignoring case', async () => {
      await setup(unassigned);

      for (const query of ['GITHUB', 'octocat', 'work']) {
        typeQuery(query);
        expect(options().map(({ textContent }) => textContent)).toEqual([
          expect.stringContaining('GitHub')
        ]);
      }
      expect(t).toHaveBeenCalledWith('itemCount', { count: 1 });
    });

    it('goes back to the first result when the query changes', async () => {
      await setup(unassigned);
      await press('ArrowDown');
      await press('ArrowDown');

      typeQuery('o');

      expect(activeOption()).toBe(options()[0]);
    });

    it('says when nothing matches, and Enter does nothing', async () => {
      await setup(unassigned);

      typeQuery('nope');
      await press('Enter');

      expect(screen.getByText('noItems')).toBeDefined();
      expect(t).toHaveBeenCalledWith('noItems', { query: 'nope' });
      expect(fetchOpItemFields).not.toHaveBeenCalled();
      expect(search()).toBeDefined();
    });
  });
});
