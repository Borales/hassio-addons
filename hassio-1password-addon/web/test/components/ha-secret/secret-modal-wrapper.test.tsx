// @vitest-environment happy-dom
import { buildSecretRows } from '@/lib/secret-status';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeItem } from '../../helpers/fixtures';

vi.mock('@/components/ha-secret/secret-modal', () => ({
  HASecretModal: ({
    activeSecret,
    opItems
  }: {
    activeSecret: { id: string };
    opItems: unknown[];
  }) => (
    <div role="dialog">
      {activeSecret.id}|{opItems.length}
    </div>
  )
}));

import {
  SecretModalProvider,
  useSecretModal
} from '@/components/ha-secret/secret-modal-provider';
import { SecretModalWrapper } from '@/components/ha-secret/secret-modal-wrapper';

const [row] = buildSecretRows([{ id: 'my_key' }], []);

const Controls = () => {
  const { openModal, closeModal } = useSecretModal();
  return (
    <>
      <button onClick={() => openModal(row)}>open</button>
      <button onClick={closeModal}>close</button>
    </>
  );
};

describe('SecretModalWrapper', () => {
  it('mounts the modal for the active secret only', () => {
    render(
      <SecretModalProvider>
        <Controls />
        <SecretModalWrapper opItems={[makeItem()]} />
      </SecretModalProvider>
    );
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    expect(screen.getByRole('dialog').textContent).toBe('my_key|1');

    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
