// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deferred } from '../../helpers/fixtures';

vi.mock('next-intl', () => import('../../helpers/next-intl'));
vi.mock('@/actions/assign-secret', () => ({ assignSecret: vi.fn() }));

import { assignSecret } from '@/actions/assign-secret';
import { HASecretModalSave } from '@/components/ha-secret/secret-modal-save';

const setup = (
  props: Partial<Parameters<typeof HASecretModalSave>[0]> = {}
) => {
  const handlers = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn()
  };
  render(
    <HASecretModalSave
      activeSecretId="my_key"
      opSecretId="item-1"
      reference="op://v/i/f"
      label="save-label"
      {...handlers}
      {...props}
    />
  );
  return handlers;
};

const saveButton = () =>
  screen.getByRole<HTMLButtonElement>('button', { name: 'save-label' });

describe('HASecretModalSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assignSecret).mockResolvedValue({ success: true });
  });

  it.each([
    ['disabled is set', { disabled: true }],
    ['no item is selected', { opSecretId: '' }],
    ['no field is selected', { reference: '' }]
  ])('cannot save while %s', (_case, props) => {
    setup(props);
    expect(saveButton().disabled).toBe(true);
  });

  it('submits the secret, item and reference, then reports success', async () => {
    const { onSuccess, onError } = setup();

    await act(async () => fireEvent.click(saveButton()));

    const formData = vi.mocked(assignSecret).mock.calls[0][0];
    expect(Object.fromEntries(formData)).toEqual({
      haSecretId: 'my_key',
      opSecretId: 'item-1',
      ref: 'op://v/i/f'
    });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
  });

  it('reports the error when the action fails', async () => {
    vi.mocked(assignSecret).mockResolvedValue({
      success: false,
      error: 'nope'
    });
    const { onSuccess, onError } = setup();

    await act(async () => fireEvent.click(saveButton()));

    expect(onError).toHaveBeenCalledWith('nope');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('locks both buttons while saving', async () => {
    const pending = deferred<{ success: boolean }>();
    vi.mocked(assignSecret).mockReturnValue(pending.promise);
    setup();

    await act(async () => fireEvent.click(saveButton()));

    const cancel = screen.getByRole<HTMLButtonElement>('button', {
      name: 'cancel'
    });
    expect(saveButton().disabled).toBe(true);
    expect(cancel.disabled).toBe(true);

    await act(async () => pending.resolve({ success: true }));
    expect(cancel.disabled).toBe(false);
  });

  it('cancels without saving', () => {
    const { onClose } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(assignSecret).not.toHaveBeenCalled();
  });
});
