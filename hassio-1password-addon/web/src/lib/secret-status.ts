import type { Field, URL } from '@1password/op-js';

export type SecretStatus = 'assigned' | 'unassigned' | 'hidden' | 'broken';

/** Why a stored 1Password reference can no longer be resolved. */
export type BrokenCause = 'field' | 'item' | 'vault';

type SecretRecord = {
  id: string;
  reference?: string | null;
  itemId?: string | null;
  isSkipped?: boolean | null;
  updatedAt?: Date | string | null;
};

type ItemRecord = {
  id: string;
  title: string;
  vaultId?: string | null;
  vault?: { id?: string; name: string } | null;
  urls?: URL[];
  fields?: Field[];
};

type GroupRecord = {
  id: string;
  name: string;
  secrets: Array<{ secretId: string }>;
};

/** A 1Password link broken down for display. `op://` is never shown in the UI. */
export type ItemReference = {
  vault: string;
  item: string;
  /** Last path segment: 1Password's field id. */
  field: string;
  /** 1Password's field label ("client secret", not "client_secret"). */
  fieldLabel: string;
  fieldType: Field['type'] | '';
};

export type SecretRow = {
  id: string;
  reference: string | null;
  itemId: string | null;
  isSkipped: boolean;
  updatedAt: Date | string | null;
  groups: Array<{ id: string; name: string }>;
  status: SecretStatus;
  broken: BrokenCause | null;
  ref: ItemReference | null;
  urls: URL[];
};

export type SecretCounts = Record<SecretStatus | 'all', number>;

export const parseReference = (reference?: string | null) => {
  const match = /^op:\/\/([^/]+)\/(.+)\/([^/]+)$/.exec(reference || '');
  if (!match) return null;
  const [, vault, item, field] = match;
  return { vault, item, field };
};

const pointsAt = (segment: string, id: string, title: string) =>
  [id, title].some(
    (name) => segment === name || segment.startsWith(`${name}/`)
  );

/**
 * Work out why a reference no longer resolves, from what the last sync stored.
 *
 * - Deleting an item clears `itemId` (FK `SetNull`) but keeps `reference`.
 * - `Item.fields[].reference` holds the exact strings `op read` accepts, so a
 *   stored reference missing from that list would fail to read. That includes
 *   an item renamed or moved in 1Password, since the old path is gone too.
 * - Items only get their field details once linked; with none stored there is
 *   nothing to compare against, so the link is assumed healthy.
 */
export const getBrokenCause = (
  secret: Pick<SecretRecord, 'reference' | 'itemId'>,
  items: ItemRecord[]
): BrokenCause | null => {
  const parsed = parseReference(secret.reference);
  if (!parsed) return null;

  const item = secret.itemId
    ? items.find(({ id }) => id === secret.itemId)
    : undefined;

  if (!item) {
    // A linked item outside the loaded page is unknown, not missing.
    if (secret.itemId) return null;

    const vaultIsReadable = items.some(({ vault, vaultId }) =>
      [vault?.name, vaultId].includes(parsed.vault)
    );
    return vaultIsReadable ? 'item' : 'vault';
  }

  const fields = item.fields ?? [];
  if (fields.length === 0) return null;
  if (fields.some((field) => field.reference === secret.reference)) return null;

  const samePath =
    pointsAt(parsed.item, item.id, item.title) &&
    [item.vault?.name, item.vaultId].includes(parsed.vault);

  return samePath ? 'field' : 'item';
};

export const getSecretStatus = (
  secret: Pick<SecretRecord, 'itemId' | 'isSkipped'>,
  broken: BrokenCause | null
): SecretStatus => {
  if (secret.isSkipped) return 'hidden';
  if (broken) return 'broken';
  return secret.itemId ? 'assigned' : 'unassigned';
};

const toItemReference = (
  secret: SecretRecord,
  item: ItemRecord | undefined,
  broken: BrokenCause | null
): ItemReference | null => {
  const parsed = parseReference(secret.reference);
  if (!parsed) return null;

  const definition = item?.fields?.find(
    (field) => field.reference === secret.reference
  );
  // A broken link keeps showing the stale path; a healthy one the current names.
  const current = !broken && item;

  return {
    vault: (current && item?.vault?.name) || parsed.vault,
    item: (current && item?.title) || parsed.item,
    field: parsed.field,
    fieldLabel: definition?.label || parsed.field.replace(/_/g, ' '),
    fieldType: definition?.type ?? ''
  };
};

// Broken rows rise to the top, hidden rows sink to the bottom.
const rank = ({ status }: SecretRow) =>
  status === 'broken' ? 0 : status === 'hidden' ? 2 : 1;

export const buildSecretRows = (
  secrets: SecretRecord[],
  items: ItemRecord[],
  groups: GroupRecord[] = []
): SecretRow[] => {
  const groupsBySecret = new Map<string, SecretRow['groups']>();
  for (const { id, name, secrets: members } of groups) {
    for (const { secretId } of members) {
      groupsBySecret.set(secretId, [
        ...(groupsBySecret.get(secretId) ?? []),
        { id, name }
      ]);
    }
  }

  return secrets
    .map((secret) => {
      const item = secret.itemId
        ? items.find(({ id }) => id === secret.itemId)
        : undefined;
      const broken = getBrokenCause(secret, items);

      return {
        id: secret.id,
        reference: secret.reference ?? null,
        itemId: secret.itemId ?? null,
        isSkipped: !!secret.isSkipped,
        updatedAt: secret.updatedAt ?? null,
        groups: groupsBySecret.get(secret.id) ?? [],
        status: getSecretStatus(secret, broken),
        broken,
        ref: toItemReference(secret, item, broken),
        urls: item?.urls ?? []
      };
    })
    .sort((a, b) => rank(a) - rank(b));
};

export const countByStatus = (rows: SecretRow[]): SecretCounts => {
  const counts: SecretCounts = {
    all: rows.length,
    assigned: 0,
    unassigned: 0,
    hidden: 0,
    broken: 0
  };
  for (const { status } of rows) counts[status] += 1;
  return counts;
};

/** Mobile tab badge: red when anything is broken, amber for unassigned only. */
export const getSecretsBadge = (rows: SecretRow[]) => {
  const counts = countByStatus(rows);
  if (counts.broken > 0) return 'error' as const;
  return counts.unassigned > 0 ? ('warning' as const) : null;
};

export type SecretsBadge = ReturnType<typeof getSecretsBadge>;

/** Matches the key, the 1Password vault, item and field, and group names. */
export const matchesSearch = (row: SecretRow, query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return [
    row.id,
    row.ref?.vault,
    row.ref?.item,
    row.ref?.fieldLabel,
    ...row.groups.map(({ name }) => name)
  ]
    .join(' ')
    .toLowerCase()
    .includes(needle);
};

export const eventForGroup = (name?: string | null) =>
  `onepassword_group_${name || '{name}'}_updated`;
