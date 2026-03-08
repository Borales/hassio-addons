// @vitest-environment happy-dom

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    onPress,
    onClick,
    isDisabled,
    isLoading,
    color,
    type
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    onClick?: () => void;
    isDisabled?: boolean;
    isLoading?: boolean;
    color?: string;
    type?: string;
  }) => (
    <button
      onClick={onPress || onClick}
      disabled={isDisabled}
      data-loading={String(isLoading)}
      data-color={color}
      type={type as any}
    >
      {children}
    </button>
  )
}));

vi.mock('@/actions/assign-secret', () => ({
  assignSecret: vi.fn()
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useActionState: vi.fn().mockReturnValue([null, vi.fn(), false])
  };
});

import { fireEvent, render, screen } from '@testing-library/react';
import React, { useActionState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HASecretModalSave } from '@/components/ha-secret/secret-modal-save';

const defaultProps = {
  activeSecretId: 'ha-secret-123',
  opSecretId: 'op-secret-456',
  reference: 'op://vault/item/field',
  onClose: vi.fn(),
  onSuccess: vi.fn()
};

describe('HASecretModalSave', () => {
  beforeEach(() => {
    vi.mocked(useActionState).mockReturnValue([null, vi.fn(), false]);
    defaultProps.onClose.mockClear();
    defaultProps.onSuccess.mockClear();
  });

  it('renders a form element', () => {
    render(<HASecretModalSave {...defaultProps} />);
    expect(document.querySelector('form')).toBeDefined();
  });

  it('renders cancel button with label "cancel"', () => {
    render(<HASecretModalSave {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons.find((b) => b.textContent === 'cancel');
    expect(cancelButton).toBeDefined();
  });

  it('renders save button with label "save"', () => {
    render(<HASecretModalSave {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find((b) => b.textContent === 'save');
    expect(saveButton).toBeDefined();
  });

  it('cancel button calls onClose when clicked', () => {
    const onClose = vi.fn();
    render(<HASecretModalSave {...defaultProps} onClose={onClose} />);
    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons.find((b) => b.textContent === 'cancel')!;
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hidden input haSecretId has correct value', () => {
    render(<HASecretModalSave {...defaultProps} />);
    const input = document.querySelector(
      'input[name="haSecretId"]'
    ) as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('ha-secret-123');
  });

  it('hidden input opSecretId has correct value', () => {
    render(<HASecretModalSave {...defaultProps} />);
    const input = document.querySelector(
      'input[name="opSecretId"]'
    ) as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('op-secret-456');
  });

  it('hidden input ref has correct value', () => {
    render(<HASecretModalSave {...defaultProps} />);
    const input = document.querySelector(
      'input[name="ref"]'
    ) as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('op://vault/item/field');
  });

  it('save button is disabled when opSecretId is empty string', () => {
    render(<HASecretModalSave {...defaultProps} opSecretId="" />);
    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find(
      (b) => b.textContent === 'save'
    ) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  it('save button is disabled when reference is empty string', () => {
    render(<HASecretModalSave {...defaultProps} reference="" />);
    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find(
      (b) => b.textContent === 'save'
    ) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  it('save button is enabled when both opSecretId and reference are set', () => {
    render(<HASecretModalSave {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find(
      (b) => b.textContent === 'save'
    ) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false);
  });

  it('error message is NOT shown when state is null', () => {
    vi.mocked(useActionState).mockReturnValue([null, vi.fn(), false]);
    render(<HASecretModalSave {...defaultProps} />);
    // No error div should be present
    const errorDiv = document.querySelector('.bg-danger-50');
    expect(errorDiv).toBeNull();
  });

  it('error message IS shown when state has success: false and error message', () => {
    vi.mocked(useActionState).mockReturnValue([
      { success: false, error: 'Failed' },
      vi.fn(),
      false
    ]);
    render(<HASecretModalSave {...defaultProps} />);
    const errorDiv = document.querySelector('.bg-danger-50');
    expect(errorDiv).toBeDefined();
    expect(errorDiv!.textContent).toContain('Failed');
  });
});
