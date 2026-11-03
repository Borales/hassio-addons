import type { ModalItem } from '@/components/ha-secret/secret-modal';
import type { GroupWithSecrets } from '@/service/group.service';
import type { Field } from '@1password/op-js';

const DATE = new Date('2026-01-01T00:00:00Z');

/** A field of the "Mi Home" item in the "Smart Home" vault. */
export const makeField = (id: string, overrides: Partial<Field> = {}): Field =>
  ({
    id,
    type: 'CONCEALED',
    label: id,
    value: '********',
    reference: `op://Smart Home/Mi Home/${id}`,
    ...overrides
  }) as Field;

export const makeItem = (overrides: Partial<ModalItem> = {}): ModalItem => ({
  id: 'item-1',
  title: 'Mi Home',
  category: 'LOGIN',
  additionalInfo: 'user@example.com',
  vaultId: 'vault-1',
  vault: { name: 'Smart Home' },
  createdAt: DATE,
  updatedAt: DATE,
  urls: [],
  fields: [makeField('password')],
  ...overrides
});

export const makeGroup = (
  name: string,
  secretIds: string[] = [],
  overrides: Partial<GroupWithSecrets> = {}
): GroupWithSecrets => ({
  id: `group-${name}`,
  name,
  description: null,
  createdAt: DATE,
  updatedAt: DATE,
  secrets: secretIds.map((secretId) => ({ secretId, addedAt: DATE })),
  ...overrides
});

/** A promise settled by the test, to observe what happens while it's pending. */
export const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
