// @vitest-environment happy-dom

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

vi.mock('@heroui/react', () => ({
  Select: ({
    children,
    label,
    items,
    placeholder,
    onSelectionChange
  }: {
    children: (item: any) => React.ReactNode;
    label?: string;
    items?: any[];
    placeholder?: string;
    onSelectionChange?: (keys: any) => void;
  }) => (
    <div
      data-testid="select"
      data-label={label}
      data-placeholder={placeholder}
      onClick={() => onSelectionChange && onSelectionChange(new Set(['test']))}
    >
      {Array.isArray(items) ? items.map(children) : null}
    </div>
  ),
  SelectItem: ({
    children,
    description,
    textValue
  }: {
    children: React.ReactNode;
    description?: string;
    textValue?: string;
  }) => (
    <div
      data-testid="select-item"
      data-description={description}
      data-text={textValue}
    >
      {children}
    </div>
  )
}));

vi.mock('@1password/op-js', () => ({}));

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { HASecretModalFieldList } from '@/components/ha-secret/secret-modal-field-list';

const makeField = (
  overrides: Partial<{
    id: string;
    type: string;
    value: string;
    label: string;
    reference: string;
  }> = {}
) =>
  ({
    id: 'field-id',
    type: 'CONCEALED' as any,
    value: 'secret-value',
    label: 'My Field',
    reference: 'op://vault/item/field',
    ...overrides
  }) as any;

describe('HASecretModalFieldList', () => {
  it('renders a Select with the translated label', () => {
    render(
      <HASecretModalFieldList
        reference={new Set()}
        fields={[makeField()]}
        onSelectionChange={undefined}
      />
    );
    const select = screen.getByTestId('select');
    expect(select).toBeDefined();
    // useTranslations returns key, so t('fieldItemLabel') => 'fieldItemLabel'
    expect(select.getAttribute('data-label')).toBe('fieldItemLabel');
  });

  it('filters out OTP type fields', () => {
    render(
      <HASecretModalFieldList
        reference={new Set()}
        fields={[
          makeField({ type: 'OTP', label: 'OTP Field' }),
          makeField({ label: 'Normal Field' })
        ]}
        onSelectionChange={undefined}
      />
    );
    const items = screen.getAllByTestId('select-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toBe('Normal Field');
  });

  it('filters out UNKNOWN type fields', () => {
    render(
      <HASecretModalFieldList
        reference={new Set()}
        fields={[
          makeField({ type: 'UNKNOWN', label: 'Unknown Field' }),
          makeField({ label: 'Valid Field' })
        ]}
        onSelectionChange={undefined}
      />
    );
    const items = screen.getAllByTestId('select-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toBe('Valid Field');
  });

  it('filters out fields with no value', () => {
    render(
      <HASecretModalFieldList
        reference={new Set()}
        fields={[
          makeField({ value: '', label: 'Empty Field' }),
          makeField({ label: 'Has Value' })
        ]}
        onSelectionChange={undefined}
      />
    );
    const items = screen.getAllByTestId('select-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toBe('Has Value');
  });

  it('renders remaining valid fields as SelectItems', () => {
    render(
      <HASecretModalFieldList
        reference={new Set()}
        fields={[
          makeField({ label: 'Field 1', reference: 'op://v/i/f1' }),
          makeField({ label: 'Field 2', reference: 'op://v/i/f2' }),
          makeField({ type: 'OTP', label: 'OTP Field' })
        ]}
        onSelectionChange={undefined}
      />
    );
    const items = screen.getAllByTestId('select-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('Field 1');
    expect(items[1].textContent).toBe('Field 2');
  });

  it('shows placeholder when fields array is empty', () => {
    render(
      <HASecretModalFieldList
        reference={new Set()}
        fields={[]}
        onSelectionChange={undefined}
      />
    );
    const select = screen.getByTestId('select');
    // t('fieldItemPlaceholder') => 'fieldItemPlaceholder'
    expect(select.getAttribute('data-placeholder')).toBe(
      'fieldItemPlaceholder'
    );
  });

  it('does not show placeholder when fields are present', () => {
    render(
      <HASecretModalFieldList
        reference={new Set()}
        fields={[makeField()]}
        onSelectionChange={undefined}
      />
    );
    const select = screen.getByTestId('select');
    expect(select.getAttribute('data-placeholder')).toBeNull();
  });

  it('passes onSelectionChange to Select', () => {
    const onSelectionChange = vi.fn();
    render(
      <HASecretModalFieldList
        reference={new Set()}
        fields={[makeField()]}
        onSelectionChange={onSelectionChange}
      />
    );
    const select = screen.getByTestId('select');
    fireEvent.click(select);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });
});
