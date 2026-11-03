// @vitest-environment happy-dom
import type { ItemReference } from '@/lib/secret-status';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ItemRef } from '@/components/op-secret/item-ref';

const reference: ItemReference = {
  vault: 'Smart Home',
  item: 'Mi Home',
  field: 'client_secret',
  fieldLabel: 'client secret',
  fieldType: 'CONCEALED'
};

const setup = (
  overrides: Partial<ItemReference> = {},
  stale: 'item' | 'field' | null = null
) =>
  render(
    <ItemRef
      reference={{ ...reference, ...overrides }}
      stale={stale}
      fieldAriaLabel="the field"
    />
  ).container;

describe('ItemRef', () => {
  it('shows vault, item and field label, never the op:// path', () => {
    const container = setup();

    expect(container.textContent).toBe('Smart Home·Mi Homeclient secret');
    expect(container.firstElementChild?.getAttribute('title')).toBe(
      'Smart Home · Mi Home · client secret'
    );
  });

  it('labels the field token for screen readers', () => {
    setup();
    expect(screen.getByLabelText('the field').textContent).toBe(
      'client secret'
    );
  });

  it.each(['item', 'field'] as const)(
    'strikes the missing %s when stale',
    (stale) => {
      const container = setup({}, stale);
      expect(container.querySelector(`.iref-stale-${stale}`)).not.toBeNull();
    }
  );

  it('is not marked stale for a healthy link', () => {
    expect(setup().querySelector('[class*="iref-stale"]')).toBeNull();
  });

  it('draws a different icon for concealed and text fields', () => {
    const iconOf = (fieldType: ItemReference['fieldType']) =>
      setup({ fieldType }).querySelector('svg')?.innerHTML;

    const lock = iconOf('CONCEALED');
    const text = iconOf('STRING');

    expect(lock).toBeDefined();
    expect(text).toBeDefined();
    expect(lock).not.toBe(text);
  });

  it('draws no field icon when the type is unknown or the link is stale', () => {
    expect(setup({ fieldType: '' }).querySelector('svg')).toBeNull();
    expect(setup({}, 'field').querySelector('svg')).toBeNull();
  });
});
