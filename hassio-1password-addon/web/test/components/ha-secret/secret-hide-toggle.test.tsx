// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deferred } from '../../helpers/fixtures';

vi.mock('next-intl', () => import('../../helpers/next-intl'));
vi.mock('@/actions/toggle-skip-secret', () => ({
  toggleSkipSecret: vi.fn()
}));

import { toggleSkipSecret } from '@/actions/toggle-skip-secret';
import { HASecretHideToggle } from '@/components/ha-secret/secret-hide-toggle';
import { ToastProvider } from '@/components/ui/toast-provider';

const setup = (isSkipped: boolean | null = false) =>
  render(
    <ToastProvider>
      <HASecretHideToggle secretId="my_key" isSkipped={isSkipped} />
    </ToastProvider>
  );

const click = (name: string) =>
  act(async () => fireEvent.click(screen.getByRole('button', { name })));

describe('HASecretHideToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(toggleSkipSecret).mockResolvedValue({ success: true } as never);
  });

  it('labels the button with what it will do', () => {
    const { unmount } = setup(false);
    expect(screen.getByRole('button', { name: 'hideAria' })).toBeDefined();
    unmount();

    setup(true);
    expect(screen.getByRole('button', { name: 'showAria' })).toBeDefined();
  });

  it.each([
    [false, 'hideAria', 'hidden'],
    [true, 'showAria', 'shown']
  ])(
    'when skipped=%s, %s toggles the secret and toasts "%s"',
    async (isSkipped, button, toast) => {
      setup(isSkipped);

      await click(button);

      const formData = vi.mocked(toggleSkipSecret).mock.calls[0][0];
      expect(formData.get('haSecretId')).toBe('my_key');
      expect(screen.getByRole('status').textContent).toContain(toast);
    }
  );

  it('shows an error when the undo fails', async () => {
    setup();
    await click('hideAria');
    vi.mocked(toggleSkipSecret).mockResolvedValue({ success: false });

    await click('undo');

    expect(screen.getByRole('status').textContent).toContain('undoFailed');
  });

  it('undo toggles it back', async () => {
    setup();
    await click('hideAria');

    await click('undo');

    expect(toggleSkipSecret).toHaveBeenCalledTimes(2);
    const formData = vi.mocked(toggleSkipSecret).mock.calls[1][0];
    expect(formData.get('haSecretId')).toBe('my_key');
  });

  it.each([
    ['the error', 'locked', 'locked'],
    ['a fallback', undefined, 'toggleSkipFailed']
  ])('shows %s with no undo when it fails', async (_case, error, text) => {
    vi.mocked(toggleSkipSecret).mockResolvedValue({
      success: false,
      error
    } as never);
    setup();

    await click('hideAria');

    expect(screen.getByRole('status').textContent).toBe(text);
    expect(screen.queryByRole('button', { name: 'undo' })).toBeNull();
  });

  it('is locked while the action runs', async () => {
    const pending = deferred<never>();
    vi.mocked(toggleSkipSecret).mockReturnValue(pending.promise);
    setup();

    await click('hideAria');
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'hideAria' })
        .disabled
    ).toBe(true);

    await act(async () => pending.resolve({ success: true } as never));
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'hideAria' })
        .disabled
    ).toBe(false);
  });
});
