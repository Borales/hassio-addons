// @vitest-environment happy-dom
import { buildSecretRows } from '@/lib/secret-status';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeField, makeGroup, makeItem } from '../../helpers/fixtures';

vi.mock('next-intl', () => import('../../helpers/next-intl'));
vi.mock('@/actions/assign-secret', () => ({ assignSecret: vi.fn() }));
vi.mock('@/actions/unassign-secret', () => ({ unassignSecret: vi.fn() }));
vi.mock('@/actions/toggle-skip-secret', () => ({ toggleSkipSecret: vi.fn() }));

import { HASecretList } from '@/components/ha-secret/secret-list';
import {
  SecretModalProvider,
  useSecretModal
} from '@/components/ha-secret/secret-modal-provider';
import { ToastProvider } from '@/components/ui/toast-provider';

const REFERENCE = 'op://Smart Home/Mi Home/password';

const item = makeItem({
  fields: [makeField('password', { label: 'password', reference: REFERENCE })]
});

const healthy = [
  {
    id: 'mqtt_password',
    reference: REFERENCE,
    itemId: item.id,
    updatedAt: new Date()
  },
  { id: 'wifi_password' },
  { id: 'old_token', isSkipped: true }
];
const broken = [
  {
    id: 'gone_field',
    reference: 'op://Smart Home/Mi Home/gone',
    itemId: item.id
  },
  { id: 'gone_item', reference: 'op://Smart Home/Deleted/password' },
  { id: 'gone_vault', reference: 'op://Lost/Deleted/password' }
];

const groups = [makeGroup('xiaomi', ['mqtt_password'])];

const healthyRows = buildSecretRows(healthy, [item], groups);
const allRows = buildSecretRows([...healthy, ...broken], [item], groups);

const HEALTHY_IDS = healthy.map(({ id }) => id);
const ALL_IDS = [...HEALTHY_IDS, ...broken.map(({ id }) => id)];

const ActiveSecretProbe = () => (
  <output data-testid="active-secret">
    {useSecretModal().activeSecret?.id}
  </output>
);

const tree = (
  rows: typeof allRows,
  banners: Record<string, ReactNode> = {}
) => (
  <ToastProvider>
    <SecretModalProvider>
      <HASecretList items={rows} {...banners} />
      <ActiveSecretProbe />
    </SecretModalProvider>
  </ToastProvider>
);

const setup = (rows = allRows, banners?: Record<string, ReactNode>) =>
  render(tree(rows, banners));

const table = () => within(screen.getByRole('table'));
const phoneList = () => within(screen.getByRole('list', { name: 'ariaLabel' }));

/** Keys listed in the desktop table, of those expected to exist. */
const shownKeys = (ids = ALL_IDS) =>
  ids.filter((id) => table().queryByText(id) !== null);

const row = (id: string) => table().getByText(id).closest('tr') as HTMLElement;
const phoneRow = (id: string) =>
  phoneList().getByText(id).closest('li') as HTMLElement;

const segments = () =>
  within(screen.getByRole('group', { name: 'filterLabel' }));
const segment = (key: string) =>
  segments().queryByRole('button', { name: new RegExp(`^filters\\.${key}`) });
const pressSegment = (key: string) => fireEvent.click(segment(key)!);
const isPressed = (key: string) =>
  segment(key)?.getAttribute('aria-pressed') === 'true';

const searchBox = () =>
  screen.getByRole<HTMLInputElement>('searchbox', { name: 'searchLabel' });
const typeSearch = (value: string) =>
  fireEvent.change(searchBox(), { target: { value } });

const activeSecret = () => screen.getByTestId('active-secret').textContent;

describe('HASecretList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('filter segments', () => {
    it.each([
      ['all', 6],
      ['broken', 3],
      ['unassigned', 1],
      ['assigned', 1],
      ['hidden', 1]
    ])('counts %s as %i', (key, count) => {
      setup();
      expect(segment(key)?.textContent).toBe(`filters.${key}${count}`);
    });

    it('starts on All', () => {
      setup();

      expect(isPressed('all')).toBe(true);
      expect(shownKeys()).toEqual(ALL_IDS);
    });

    it.each([
      ['broken', ['gone_field', 'gone_item', 'gone_vault']],
      ['unassigned', ['wifi_password']],
      ['assigned', ['mqtt_password']],
      ['hidden', ['old_token']]
    ])('narrows the list to %s', (key, expected) => {
      setup();

      pressSegment(key);

      expect(isPressed(key)).toBe(true);
      expect(isPressed('all')).toBe(false);
      expect(shownKeys()).toEqual(expected);
    });

    it('only offers Broken when something is broken', () => {
      setup(healthyRows);
      expect(segment('broken')).toBeNull();
    });

    it('falls back to All when the Broken count reaches zero', () => {
      const { rerender } = setup();
      pressSegment('broken');
      expect(shownKeys()).toHaveLength(3);

      rerender(tree(healthyRows));

      expect(segment('broken')).toBeNull();
      expect(isPressed('all')).toBe(true);
      expect(shownKeys(HEALTHY_IDS)).toEqual(HEALTHY_IDS);
    });
  });

  describe('search', () => {
    it.each([
      ['the key', 'WIFI', ['wifi_password']],
      ['the item', 'mi home', ['mqtt_password', 'gone_field']],
      ['the vault', 'lost', ['gone_vault']],
      ['a group', 'xiaomi', ['mqtt_password']]
    ])('matches %s', (_field, query, expected) => {
      setup();

      typeSearch(query);

      expect(shownKeys()).toEqual(expected);
    });

    it('combines with the filter', () => {
      setup();

      pressSegment('broken');
      typeSearch('mi home');

      expect(shownKeys()).toEqual(['gone_field']);
    });

    it('offers to clear the search', () => {
      setup();

      typeSearch('wifi');
      fireEvent.click(screen.getByRole('button', { name: 'clearSearch' }));

      expect(searchBox().value).toBe('');
      expect(shownKeys()).toEqual(ALL_IDS);
    });

    it('has nothing to clear while empty', () => {
      setup();
      expect(screen.queryByRole('button', { name: 'clearSearch' })).toBeNull();
    });
  });

  describe('"/" shortcut', () => {
    const pressSlash = () => fireEvent.keyDown(window, { key: '/' });

    it('focuses the search, without typing the slash', () => {
      setup();

      const notPrevented = pressSlash();

      expect(document.activeElement).toBe(searchBox());
      expect(notPrevented).toBe(false);
    });

    it('ignores other keys', () => {
      setup();

      fireEvent.keyDown(window, { key: 'a' });

      expect(document.activeElement).not.toBe(searchBox());
    });

    it.each([
      ['an input', <input key="field" aria-label="other" />],
      ['a textarea', <textarea key="field" aria-label="other" />]
    ])('leaves typing in %s alone', (_tag, field) => {
      render(
        <>
          {tree(allRows)}
          {field}
        </>
      );
      const other = screen.getByLabelText('other');
      other.focus();

      const notPrevented = pressSlash();

      expect(document.activeElement).toBe(other);
      expect(notPrevented).toBe(true);
    });

    it('does nothing while a dialog is open', () => {
      render(
        <>
          {tree(allRows)}
          <dialog open />
        </>
      );

      pressSlash();

      expect(document.activeElement).not.toBe(searchBox());
    });
  });

  describe('empty states', () => {
    it('explains when there are no secrets, with no list controls', () => {
      setup([]);

      expect(screen.getByText('empty.title')).toBeDefined();
      expect(screen.getByText('empty.body')).toBeDefined();
      expect(screen.queryByRole('searchbox')).toBeNull();
      expect(screen.queryByRole('group', { name: 'filterLabel' })).toBeNull();
      expect(screen.queryByRole('table')).toBeNull();
    });

    it('explains when the search matches nothing', () => {
      setup();

      typeSearch('nope');

      expect(screen.getByText('noMatch')).toBeDefined();
      expect(screen.getByText('noMatchQuery')).toBeDefined();
      expect(screen.queryByRole('table')).toBeNull();
    });

    it('explains when the filter matches nothing', () => {
      setup(buildSecretRows([{ id: 'wifi_password' }], []));

      pressSegment('hidden');

      expect(screen.getByText('noMatch')).toBeDefined();
      expect(screen.getByText('noMatchFilter')).toBeDefined();
    });

    it('clears both the search and the filter from there', () => {
      setup();
      pressSegment('hidden');
      typeSearch('nope');

      fireEvent.click(screen.getByRole('button', { name: 'clearFilters' }));

      expect(searchBox().value).toBe('');
      expect(isPressed('all')).toBe(true);
      expect(shownKeys()).toEqual(ALL_IDS);
    });
  });

  describe('assigned rows', () => {
    it('opens the modal from the key', () => {
      setup();

      fireEvent.click(
        within(row('mqtt_password')).getByRole('button', {
          name: 'mqtt_password'
        })
      );
      expect(activeSecret()).toBe('mqtt_password');
    });

    it('shows the item, a copy button for the reference, and the groups', () => {
      setup();

      const cells = within(row('mqtt_password'));
      expect(cells.getByText('Mi Home')).toBeDefined();
      expect(cells.getByText('xiaomi')).toBeDefined();
      expect(
        cells.getByRole('button', {
          name: `actions.copyReference: ${REFERENCE}`
        })
      ).toBeDefined();
    });

    it('offers edit, unassign and hide', () => {
      setup();

      const cells = within(row('mqtt_password'));
      fireEvent.click(cells.getByRole('button', { name: 'changeAria' }));
      expect(activeSecret()).toBe('mqtt_password');
      expect(cells.getByRole('button', { name: 'unassignAria' })).toBeDefined();
      expect(cells.getByRole('button', { name: 'hideAria' })).toBeDefined();
    });

    it('shows when it was last updated', () => {
      setup();
      expect(within(row('mqtt_password')).getByRole('time')).toBeDefined();
    });
  });

  describe('unassigned rows', () => {
    it('offers to assign, and nothing that needs a link', () => {
      setup();

      const cells = within(row('wifi_password'));
      fireEvent.click(cells.getByRole('button', { name: 'assignAction' }));

      expect(activeSecret()).toBe('wifi_password');
      expect(cells.queryByRole('button', { name: 'changeAria' })).toBeNull();
      expect(cells.queryByRole('button', { name: 'unassignAria' })).toBeNull();
      expect(cells.getByRole('button', { name: 'hideAria' })).toBeDefined();
      expect(cells.queryByRole('time')).toBeNull();
    });
  });

  describe('hidden rows', () => {
    it('are marked as hidden', () => {
      setup();

      expect(row('old_token').className).toContain('is-hidden');
      expect(row('mqtt_password').className).not.toContain('is-hidden');
    });

    it.each([
      ['table', () => row('old_token')],
      ['phone list', () => phoneRow('old_token')]
    ])('can only be shown again in the %s', (_where, getRow) => {
      setup();

      const cells = within(getRow());
      expect(cells.queryByRole('button', { name: 'old_token' })).toBeNull();
      expect(cells.queryByRole('button', { name: 'changeAria' })).toBeNull();
      expect(cells.queryByRole('button', { name: 'unassignAria' })).toBeNull();
      expect(cells.queryByRole('button', { name: 'assignAction' })).toBeNull();
      expect(cells.getByRole('button', { name: 'showAria' })).toBeDefined();
      expect(cells.getByText('hiddenNotSynced')).toBeDefined();
    });
  });

  describe('broken rows', () => {
    it.each([
      ['table', () => row('gone_item')],
      ['phone list', () => phoneRow('gone_item')]
    ])('offer re-link instead of edit in the %s', (_where, getRow) => {
      setup();

      const cells = within(getRow());
      fireEvent.click(cells.getByRole('button', { name: 'relink' }));

      expect(activeSecret()).toBe('gone_item');
      expect(cells.queryByRole('button', { name: 'changeAria' })).toBeNull();
      expect(cells.getByRole('button', { name: 'unassignAria' })).toBeDefined();
    });

    it.each([
      ['gone_field', 'field', '.iref-stale-field'],
      ['gone_item', 'item', '.iref-stale-item']
    ])('%s names the cause and strikes the %s', (id, cause, stale) => {
      setup();

      expect(within(row(id)).getByText(cause)).toBeDefined();
      expect(row(id).querySelector(stale)).not.toBeNull();
    });

    it('strike nothing when the whole vault is gone', () => {
      setup();

      expect(within(row('gone_vault')).getByText('vault')).toBeDefined();
      expect(
        row('gone_vault').querySelector('[class*="iref-stale"]')
      ).toBeNull();
    });
  });

  describe('banners', () => {
    const banners = {
      serviceAccountBanner: <div role="alert">service-account</div>,
      rateLimitBanner: <div role="alert">rate-limit</div>
    };
    const alerts = () =>
      screen.getAllByRole('alert').map(({ textContent }) => textContent);

    it('puts the broken banner between the other two', () => {
      setup(allRows, banners);

      expect(alerts()).toEqual([
        'service-account',
        expect.stringContaining('banner'),
        'rate-limit'
      ]);
    });

    it('leaves out the broken banner when nothing is broken', () => {
      setup(healthyRows, banners);
      expect(alerts()).toEqual(['service-account', 'rate-limit']);
    });

    it('applies the Broken filter and clears the search', () => {
      setup();
      typeSearch('wifi');

      fireEvent.click(screen.getByRole('button', { name: 'show' }));

      expect(searchBox().value).toBe('');
      expect(isPressed('broken')).toBe(true);
      expect(shownKeys()).toEqual(['gone_field', 'gone_item', 'gone_vault']);
    });

    it('hides its button while the Broken filter is active', () => {
      setup();

      pressSegment('broken');

      expect(screen.getByRole('heading', { name: 'banner' })).toBeDefined();
      expect(screen.queryByRole('button', { name: 'show' })).toBeNull();
    });
  });

  it('renders every row in both the table and the phone list', () => {
    setup();

    for (const id of ALL_IDS) {
      expect(screen.getAllByText(id)).toHaveLength(2);
    }
  });
});
