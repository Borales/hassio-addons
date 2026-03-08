// @vitest-environment happy-dom
vi.mock('@/components/ha-secret/secret-modal', () => ({}));

vi.mock('@/components/ha-secret/secret-modal-provider', () => ({
  useSecretModal: vi.fn()
}));

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    onPress,
    'aria-label': ariaLabel,
    title
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    'aria-label'?: string;
    title?: string;
  }) => (
    <button onClick={onPress} aria-label={ariaLabel} title={title}>
      {children}
    </button>
  )
}));

vi.mock('@phosphor-icons/react/dist/ssr', () => ({
  PencilIcon: () => <svg data-testid="pencil-icon" />
}));

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { HASecretItemEdit } from '@/components/ha-secret/secret-item-edit';
import { useSecretModal } from '@/components/ha-secret/secret-modal-provider';

const mockSecret = { id: 'secret-1', name: 'My Secret' } as any;

describe('HASecretItemEdit', () => {
  it('renders a button with aria-label "edit"', () => {
    vi.mocked(useSecretModal).mockReturnValue({
      activeSecret: null,
      openModal: vi.fn(),
      closeModal: vi.fn()
    });

    render(<HASecretItemEdit secret={mockSecret} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('edit');
  });

  it('renders a button with title "edit"', () => {
    vi.mocked(useSecretModal).mockReturnValue({
      activeSecret: null,
      openModal: vi.fn(),
      closeModal: vi.fn()
    });

    render(<HASecretItemEdit secret={mockSecret} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('title')).toBe('edit');
  });

  it('calls openModal with the secret when button is pressed', () => {
    const openModal = vi.fn();
    vi.mocked(useSecretModal).mockReturnValue({
      activeSecret: null,
      openModal,
      closeModal: vi.fn()
    });

    render(<HASecretItemEdit secret={mockSecret} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(openModal).toHaveBeenCalledWith(mockSecret);
  });

  it('renders the PencilIcon', () => {
    vi.mocked(useSecretModal).mockReturnValue({
      activeSecret: null,
      openModal: vi.fn(),
      closeModal: vi.fn()
    });

    render(<HASecretItemEdit secret={mockSecret} />);
    expect(screen.getByTestId('pencil-icon')).toBeDefined();
  });
});
