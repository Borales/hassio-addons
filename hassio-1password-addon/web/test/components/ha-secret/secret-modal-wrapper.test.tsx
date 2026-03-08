// @vitest-environment happy-dom
vi.mock('@/components/ha-secret/secret-modal-provider', () => ({
  useSecretModal: vi.fn()
}));

vi.mock('@/components/ha-secret/secret-modal', () => ({
  HASecretModal: ({
    activeSecret,
    opItems
  }: {
    activeSecret: any;
    opItems: any[];
  }) => (
    <div
      data-testid="ha-secret-modal"
      data-secret-id={activeSecret?.id}
      data-op-items-count={opItems?.length}
    />
  )
}));

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSecretModal } from '@/components/ha-secret/secret-modal-provider';
import { SecretModalWrapper } from '@/components/ha-secret/secret-modal-wrapper';

const mockOpItems = [
  { id: 'op-1', title: 'Op Item 1' },
  { id: 'op-2', title: 'Op Item 2' }
] as any[];

describe('SecretModalWrapper', () => {
  it('renders null when activeSecret is null', () => {
    vi.mocked(useSecretModal).mockReturnValue({
      activeSecret: null,
      openModal: vi.fn(),
      closeModal: vi.fn()
    });

    const { container } = render(<SecretModalWrapper opItems={mockOpItems} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders HASecretModal when activeSecret is set', () => {
    const mockSecret = { id: 'secret-1', name: 'My Secret' } as any;
    vi.mocked(useSecretModal).mockReturnValue({
      activeSecret: mockSecret,
      openModal: vi.fn(),
      closeModal: vi.fn()
    });

    render(<SecretModalWrapper opItems={mockOpItems} />);
    expect(screen.getByTestId('ha-secret-modal')).toBeDefined();
  });

  it('passes opItems to HASecretModal', () => {
    const mockSecret = { id: 'secret-1', name: 'My Secret' } as any;
    vi.mocked(useSecretModal).mockReturnValue({
      activeSecret: mockSecret,
      openModal: vi.fn(),
      closeModal: vi.fn()
    });

    render(<SecretModalWrapper opItems={mockOpItems} />);
    const modal = screen.getByTestId('ha-secret-modal');
    expect(modal.getAttribute('data-op-items-count')).toBe('2');
  });
});
