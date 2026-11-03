// @vitest-environment happy-dom
import type { Field, ResponseFieldType } from '@1password/op-js';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeField } from '../../helpers/fixtures';

vi.mock('next-intl', () => import('../../helpers/next-intl'));

import {
  getUsableFields,
  HASecretModalFieldList
} from '@/components/ha-secret/secret-modal-field-list';

const password = makeField('password');
const username = makeField('username', { type: 'STRING', value: 'octocat' });
const otp = makeField('one-time', { type: 'OTP', value: '123456' });
// The CLI can answer with UNKNOWN, though op-js leaves it out of Field's type.
const unknown = makeField('mystery', {
  type: 'UNKNOWN' as ResponseFieldType as Field['type']
});
const empty = makeField('empty', { value: '' });

describe('getUsableFields', () => {
  it('drops OTP, unknown and empty fields', () => {
    expect(getUsableFields([password, otp, unknown, empty, username])).toEqual([
      password,
      username
    ]);
  });

  it('accepts a missing list', () => {
    expect(getUsableFields()).toEqual([]);
  });
});

describe('HASecretModalFieldList', () => {
  const setup = (
    fields = [password, username],
    selected: string | null = null
  ) => {
    const onSelect = vi.fn();
    render(
      <HASecretModalFieldList
        fields={fields}
        selected={selected}
        onSelect={onSelect}
      />
    );
    return onSelect;
  };

  const radio = (label: string) =>
    screen
      .getByText(label)
      .closest('label')
      ?.querySelector('input') as HTMLInputElement;

  it('lists each usable field with its value', () => {
    setup();

    expect(screen.getByRole('radiogroup', { name: 'field' })).toBeDefined();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByText('********')).toBeDefined();
    expect(screen.getByText('octocat')).toBeDefined();
  });

  it('checks the selected field', () => {
    setup([password, username], username.reference!);

    expect(radio('username').checked).toBe(true);
    expect(radio('password').checked).toBe(false);
  });

  it('reports the reference of the picked field', () => {
    const onSelect = setup();

    fireEvent.click(radio('username'));

    expect(onSelect).toHaveBeenCalledWith(username.reference);
  });

  it('hides OTP fields, with a note', () => {
    setup([password, otp]);

    expect(screen.queryByText('one-time')).toBeNull();
    expect(screen.getByText('otpHidden')).toBeDefined();
  });

  it('has no note without an OTP field', () => {
    setup();
    expect(screen.queryByText('otpHidden')).toBeNull();
  });

  it('says so when no field can be used', () => {
    setup([otp, unknown, empty]);

    expect(screen.getByText('fieldItemPlaceholder')).toBeDefined();
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });
});
