// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deferred } from '../../helpers/fixtures';

vi.mock('next-intl', () => import('../../helpers/next-intl'));
vi.mock('@/actions/assign-secret', () => ({ assignSecret: vi.fn() }));
vi.mock('@/actions/unassign-secret', () => ({ unassignSecret: vi.fn() }));

import { assignSecret } from '@/actions/assign-secret';
import { unassignSecret } from '@/actions/unassign-secret';
import { HASecretUnassign } from '@/components/ha-secret/secret-unassign';
import { ToastProvider } from '@/components/ui/toast-provider';

const REFERENCE = 'op://Smart Home/Mi Home/password';

const setup = (itemId: string | null = 'item-1') =>
  render(
    <ToastProvider>
      <HASecretUnassign
        secretId="my_key"
        itemId={itemId}
        reference={REFERENCE}
      />
    </ToastProvider>
  );

const click = (name: string) =>
  act(async () => fireEvent.click(screen.getByRole('button', { name })));

describe('HASecretUnassign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(unassignSecret).mockResolvedValue({ success: true } as never);
    vi.mocked(assignSecret).mockResolvedValue({ success: true });
  });

  it('unassigns the secret and toasts', async () => {
    setup();

    await click('unassignAria');

    const formData = vi.mocked(unassignSecret).mock.calls[0][0];
    expect(formData.get('haSecretId')).toBe('my_key');
    expect(screen.getByRole('status').textContent).toContain('unassigned');
    expect(assignSecret).not.toHaveBeenCalled();
  });

  it('shows an error when the undo fails', async () => {
    setup();
    await click('unassignAria');
    vi.mocked(assignSecret).mockResolvedValue({ success: false });

    await click('undo');

    expect(screen.getByRole('status').textContent).toContain('undoFailed');
  });

  it('undo re-assigns the same item and reference', async () => {
    setup();
    await click('unassignAria');

    await click('undo');

    const formData = vi.mocked(assignSecret).mock.calls[0][0];
    expect(Object.fromEntries(formData)).toEqual({
      haSecretId: 'my_key',
      opSecretId: 'item-1',
      ref: REFERENCE
    });
  });

  it('offers no undo when the item no longer exists', async () => {
    setup(null);

    await click('unassignAria');

    expect(screen.getByRole('status').textContent).toContain('unassigned');
    expect(screen.queryByRole('button', { name: 'undo' })).toBeNull();
  });

  it.each([
    ['the error', 'locked', 'locked'],
    ['a fallback', undefined, 'unassignSecretFailed']
  ])('shows %s with no undo when it fails', async (_case, error, text) => {
    vi.mocked(unassignSecret).mockResolvedValue({
      success: false,
      error
    } as never);
    setup();

    await click('unassignAria');

    expect(screen.getByRole('status').textContent).toBe(text);
    expect(screen.queryByRole('button', { name: 'undo' })).toBeNull();
  });

  it('is locked while the action runs', async () => {
    const pending = deferred<never>();
    vi.mocked(unassignSecret).mockReturnValue(pending.promise);
    setup();

    await click('unassignAria');
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'unassignAria' })
        .disabled
    ).toBe(true);

    await act(async () => pending.resolve({ success: true } as never));
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'unassignAria' })
        .disabled
    ).toBe(false);
  });
});
