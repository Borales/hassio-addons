// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { deferred } from '../../helpers/fixtures';

vi.mock('next-intl', () => import('../../helpers/next-intl'));

import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const setup = (props: Partial<ComponentProps<typeof ConfirmDialog>> = {}) => {
  const onConfirm = vi.fn();
  render(
    <ConfirmDialog
      message="Are you sure?"
      onConfirm={onConfirm}
      trigger={(onOpen) => <button onClick={onOpen}>open</button>}
      {...props}
    />
  );
  return { onConfirm };
};

const open = () =>
  fireEvent.click(screen.getByRole('button', { name: 'open' }));

describe('ConfirmDialog', () => {
  it('is closed until the trigger opens it', () => {
    setup();
    expect(screen.queryByRole('dialog')).toBeNull();

    open();

    expect(screen.getByRole('dialog', { name: 'title' })).toBeDefined();
    expect(screen.getByText('Are you sure?')).toBeDefined();
  });

  it('uses custom title and button labels', () => {
    setup({ title: 'Delete it', confirmLabel: 'Do', cancelLabel: 'Keep' });
    open();

    expect(screen.getByRole('dialog', { name: 'Delete it' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Do' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeDefined();
  });

  it('cancel closes without confirming', () => {
    const { onConfirm } = setup();
    open();

    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('closes when the native dialog closes (Esc)', () => {
    const { onConfirm } = setup();
    open();

    fireEvent(screen.getByRole('dialog'), new Event('close'));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('locks its buttons while confirming, then closes', async () => {
    const pending = deferred<void>();
    setup({ onConfirm: () => pending.promise });
    open();

    const confirm = screen.getByRole<HTMLButtonElement>('button', {
      name: 'confirm'
    });
    await act(async () => fireEvent.click(confirm));

    expect(confirm.disabled).toBe(true);
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'cancel' }).disabled
    ).toBe(true);

    await act(async () => pending.resolve());

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
