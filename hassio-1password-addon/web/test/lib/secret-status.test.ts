import {
  buildSecretRows,
  countByStatus,
  eventForGroup,
  getBrokenCause,
  getSecretsBadge,
  getSecretStatus,
  matchesSearch,
  parseReference
} from '@/lib/secret-status';
import { describe, expect, it } from 'vitest';

const vault = { id: 'v1', name: 'Smart Home' };

const field = (id: string, label: string, type = 'CONCEALED') =>
  ({
    id,
    label,
    type,
    value: '***',
    reference: `op://Smart Home/Mi Home/${id}`
  }) as never;

const item = {
  id: 'i1',
  title: 'Mi Home',
  vaultId: vault.id,
  vault,
  urls: [{ href: 'mi.com', primary: true }] as never[],
  fields: [
    field('password', 'password'),
    field('client_id', 'client id', 'STRING')
  ]
};

describe('parseReference', () => {
  it('splits a reference into vault, item and field', () => {
    expect(parseReference('op://Smart Home/Mi Home/password')).toEqual({
      vault: 'Smart Home',
      item: 'Mi Home',
      field: 'password'
    });
  });

  it('keeps the middle segments as the item for references with a section', () => {
    expect(parseReference('op://Dev/Spotify/api/client_id')).toEqual({
      vault: 'Dev',
      item: 'Spotify/api',
      field: 'client_id'
    });
  });

  it.each([null, undefined, '', 'not-a-reference', 'op://only/two'])(
    'returns null for %s',
    (value) => {
      expect(parseReference(value)).toBeNull();
    }
  );
});

describe('getBrokenCause', () => {
  it('is healthy when the reference is one of the item fields', () => {
    expect(
      getBrokenCause(
        { reference: 'op://Smart Home/Mi Home/password', itemId: 'i1' },
        [item]
      )
    ).toBeNull();
  });

  it('is healthy without a reference', () => {
    expect(
      getBrokenCause({ reference: null, itemId: null }, [item])
    ).toBeNull();
  });

  it('reports a field missing from an existing item', () => {
    expect(
      getBrokenCause(
        { reference: 'op://Smart Home/Mi Home/api_key', itemId: 'i1' },
        [item]
      )
    ).toBe('field');
  });

  it('accepts ids in place of names when classifying a missing field', () => {
    expect(
      getBrokenCause({ reference: 'op://v1/i1/api_key', itemId: 'i1' }, [item])
    ).toBe('field');
  });

  it('reports the item when the FK cleared itemId but the vault is readable', () => {
    expect(
      getBrokenCause(
        { reference: 'op://Smart Home/Pushover/credential', itemId: null },
        [item]
      )
    ).toBe('item');
  });

  it('reports the vault when no readable vault matches', () => {
    expect(
      getBrokenCause(
        { reference: 'op://Personal/Pushover/credential', itemId: null },
        [item]
      )
    ).toBe('vault');
  });

  it('reports the item when it was renamed, since the old path no longer reads', () => {
    expect(
      getBrokenCause(
        { reference: 'op://Smart Home/Old Name/password', itemId: 'i1' },
        [item]
      )
    ).toBe('item');
  });

  it('reports the item when it moved to another vault', () => {
    expect(
      getBrokenCause(
        { reference: 'op://Personal/Mi Home/password', itemId: 'i1' },
        [item]
      )
    ).toBe('item');
  });

  it('assumes healthy when the item has no field details to compare against', () => {
    expect(
      getBrokenCause(
        { reference: 'op://Smart Home/Mi Home/password', itemId: 'i1' },
        [{ ...item, fields: [] }]
      )
    ).toBeNull();
  });

  it('assumes healthy when the linked item is outside the loaded list', () => {
    expect(
      getBrokenCause(
        { reference: 'op://Smart Home/Mi Home/password', itemId: 'other' },
        [item]
      )
    ).toBeNull();
  });
});

describe('getSecretStatus', () => {
  it('lets hidden win over broken', () => {
    expect(getSecretStatus({ itemId: 'i1', isSkipped: true }, 'field')).toBe(
      'hidden'
    );
  });

  it('lets broken win over assigned', () => {
    expect(getSecretStatus({ itemId: 'i1', isSkipped: false }, 'field')).toBe(
      'broken'
    );
  });

  it('separates assigned from unassigned by the linked item', () => {
    expect(getSecretStatus({ itemId: 'i1', isSkipped: false }, null)).toBe(
      'assigned'
    );
    expect(getSecretStatus({ itemId: null, isSkipped: false }, null)).toBe(
      'unassigned'
    );
  });
});

describe('buildSecretRows', () => {
  const secrets = [
    { id: 'hidden', isSkipped: true },
    { id: 'plain' },
    {
      id: 'linked',
      itemId: 'i1',
      reference: 'op://Smart Home/Mi Home/client_id'
    },
    {
      id: 'stale',
      itemId: 'i1',
      reference: 'op://Smart Home/Mi Home/api_key'
    }
  ];
  const groups = [
    { id: 'g1', name: 'one', secrets: [{ secretId: 'linked' }] },
    { id: 'g2', name: 'two', secrets: [{ secretId: 'linked' }] }
  ];

  const rows = buildSecretRows(secrets, [item], groups);
  const row = (id: string) => rows.find((r) => r.id === id)!;

  it('sorts broken rows first and hidden rows last, keeping the rest in order', () => {
    expect(rows.map(({ id }) => id)).toEqual([
      'stale',
      'plain',
      'linked',
      'hidden'
    ]);
  });

  it('resolves the field label and type of a healthy link', () => {
    expect(row('linked').ref).toEqual({
      vault: 'Smart Home',
      item: 'Mi Home',
      field: 'client_id',
      fieldLabel: 'client id',
      fieldType: 'STRING'
    });
  });

  it('falls back to a readable label for a field that no longer exists', () => {
    expect(row('stale')).toMatchObject({
      status: 'broken',
      broken: 'field',
      ref: { fieldLabel: 'api key', fieldType: '' }
    });
  });

  it('attaches every group of a secret', () => {
    expect(row('linked').groups.map(({ name }) => name)).toEqual([
      'one',
      'two'
    ]);
    expect(row('plain').groups).toEqual([]);
  });

  it('exposes the item urls for the rich icon', () => {
    expect(row('linked').urls).toEqual(item.urls);
    expect(row('plain').urls).toEqual([]);
  });

  it('has no reference details for an unassigned secret', () => {
    expect(row('plain')).toMatchObject({ status: 'unassigned', ref: null });
  });
});

describe('countByStatus', () => {
  it('counts each status and the total', () => {
    const rows = buildSecretRows(
      [
        { id: 'a' },
        { id: 'b', isSkipped: true },
        { id: 'c', reference: 'op://Gone/Item/field' }
      ],
      [item]
    );

    expect(countByStatus(rows)).toEqual({
      all: 3,
      assigned: 0,
      unassigned: 1,
      hidden: 1,
      broken: 1
    });
  });
});

describe('getSecretsBadge', () => {
  it('is red when anything is broken, even with unassigned secrets', () => {
    const rows = buildSecretRows(
      [{ id: 'a' }, { id: 'b', reference: 'op://Gone/Item/field' }],
      [item]
    );
    expect(getSecretsBadge(rows)).toBe('error');
  });

  it('is amber for unassigned only', () => {
    expect(getSecretsBadge(buildSecretRows([{ id: 'a' }], [item]))).toBe(
      'warning'
    );
  });

  it('ignores hidden secrets', () => {
    expect(
      getSecretsBadge(buildSecretRows([{ id: 'a', isSkipped: true }], [item]))
    ).toBeNull();
  });
});

describe('matchesSearch', () => {
  const [row] = buildSecretRows(
    [
      {
        id: 'xiaomi_key',
        itemId: 'i1',
        reference: 'op://Smart Home/Mi Home/client_id'
      }
    ],
    [item],
    [{ id: 'g1', name: 'vacuum', secrets: [{ secretId: 'xiaomi_key' }] }]
  );

  it.each([
    ['the key', 'XIAOMI'],
    ['the vault', 'smart home'],
    ['the item', 'mi home'],
    ['the field label', 'client id'],
    ['a group', 'vacuum'],
    ['surrounding whitespace', '  xiaomi  '],
    ['an empty query', '   ']
  ])('matches %s', (_label, query) => {
    expect(matchesSearch(row, query)).toBe(true);
  });

  it('rejects anything else', () => {
    expect(matchesSearch(row, 'spotify')).toBe(false);
  });
});

describe('eventForGroup', () => {
  it('builds the event name from the group name', () => {
    expect(eventForGroup('xiaomi')).toBe('onepassword_group_xiaomi_updated');
  });

  it('falls back to the documented placeholder', () => {
    expect(eventForGroup(null)).toBe('onepassword_group_{name}_updated');
  });
});
