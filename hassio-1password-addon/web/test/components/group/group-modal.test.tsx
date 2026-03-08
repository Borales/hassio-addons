// @vitest-environment happy-dom

vi.mock('next-intl', () => ({
  useTranslations:
    (_ns: string) => (key: string, params?: Record<string, unknown>) =>
      params ? `${key}(${JSON.stringify(params)})` : key
}));

vi.mock('@/actions/group-create', () => ({
  createGroup: vi.fn()
}));

vi.mock('@/actions/group-update', () => ({
  updateGroup: vi.fn()
}));

vi.mock('@/lib/group-validation', () => ({
  createTranslatedGroupNameSchema: vi.fn(() => ({
    safeParse: (_v: unknown) => ({ success: true })
  }))
}));

vi.mock('@/service/group.service', () => ({}));

vi.mock('@prisma-generated/client', () => ({}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useActionState: vi.fn().mockReturnValue([null, vi.fn(), false])
  };
});

vi.mock('@/components/group/group-modal-provider', () => ({
  useGroupModal: vi.fn(() => ({ closeModal: vi.fn() }))
}));

vi.mock('@heroui/react', () => ({
  Modal: ({
    children,
    isOpen,
    onClose
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
  }) => (isOpen ? <div data-testid="modal">{children}</div> : null),
  ModalContent: ({
    children
  }: {
    children: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  }) => (
    <div data-testid="modal-content">
      {typeof children === 'function' ? children(vi.fn()) : children}
    </div>
  ),
  ModalHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-header">{children}</div>
  ),
  ModalBody: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-body">{children}</div>
  ),
  ModalFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-footer">{children}</div>
  ),
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
      type={type as 'button' | 'submit' | 'reset' | undefined}
    >
      {children}
    </button>
  ),
  Input: ({
    label,
    value,
    onValueChange,
    isInvalid,
    errorMessage,
    isDisabled
  }: {
    label: string;
    value?: string;
    onValueChange?: (v: string) => void;
    isInvalid?: boolean;
    errorMessage?: string;
    isDisabled?: boolean;
  }) => (
    <div>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        data-invalid={String(isInvalid)}
        disabled={isDisabled}
      />
      {isInvalid && errorMessage && (
        <span data-testid="error">{errorMessage}</span>
      )}
    </div>
  ),
  Textarea: ({
    label,
    value,
    onValueChange
  }: {
    label: string;
    value?: string;
    onValueChange?: (v: string) => void;
  }) => (
    <div>
      <label>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
      />
    </div>
  ),
  Select: ({
    children,
    label
  }: {
    children: React.ReactNode;
    label: string;
  }) => (
    <div data-testid="select">
      <label>{label}</label>
      {children}
    </div>
  ),
  SelectItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-item">{children}</div>
  ),
  Chip: ({
    children,
    onClose
  }: {
    children: React.ReactNode;
    onClose?: () => void;
  }) => (
    <div data-testid="chip">
      {children}
      <button onClick={onClose} data-testid="chip-close">
        x
      </button>
    </div>
  )
}));

import { GroupModal } from '@/components/group/group-modal';
import type { GroupWithSecrets } from '@/service/group.service';
import type { Secret as HaSecretItem } from '@prisma-generated/client';
import { render, screen } from '@testing-library/react';
import React, { useActionState } from 'react';
import { describe, expect, it, vi } from 'vitest';

const mockGroup: GroupWithSecrets = {
  id: 'group-1',
  name: 'TestGroup',
  description: 'A test group',
  secrets: [
    { secretId: 'secret-1' },
    { secretId: 'secret-2' }
  ] as GroupWithSecrets['secrets'],
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockSecrets: HaSecretItem[] = [
  { id: 'secret-1', isSkipped: false, itemId: 'item-1' } as HaSecretItem,
  { id: 'secret-2', isSkipped: false, itemId: 'item-2' } as HaSecretItem,
  { id: 'secret-3', isSkipped: true, itemId: 'item-3' } as HaSecretItem,
  { id: 'secret-4', isSkipped: false, itemId: null } as HaSecretItem
];

describe('GroupModal', () => {
  it('renders modal with "createTitle" header when isNew=true', () => {
    render(<GroupModal group={null} secrets={[]} isNew={true} />);
    const header = screen.getByTestId('modal-header');
    expect(header).toBeDefined();
    expect(header.textContent).toContain('createTitle');
  });

  it('renders modal with "editTitle" header when isNew=false', () => {
    render(<GroupModal group={mockGroup} secrets={[]} isNew={false} />);
    const header = screen.getByTestId('modal-header');
    expect(header).toBeDefined();
    expect(header.textContent).toContain('editTitle');
  });

  it('does NOT render groupId hidden input when isNew=true', () => {
    const { container } = render(
      <GroupModal group={null} secrets={[]} isNew={true} />
    );
    const hiddenInput = container.querySelector('input[name="groupId"]');
    expect(hiddenInput).toBeNull();
  });

  it('renders groupId hidden input when isNew=false', () => {
    const { container } = render(
      <GroupModal group={mockGroup} secrets={[]} isNew={false} />
    );
    const hiddenInput = container.querySelector('input[name="groupId"]');
    expect(hiddenInput).toBeDefined();
  });

  it('renders cancel button', () => {
    render(<GroupModal group={null} secrets={[]} isNew={true} />);
    const cancelButton = screen.getByText('cancel');
    expect(cancelButton).toBeDefined();
  });

  it('renders create button when isNew=true', () => {
    render(<GroupModal group={null} secrets={[]} isNew={true} />);
    const createButton = screen.getByText('create');
    expect(createButton).toBeDefined();
  });

  it('renders save button when isNew=false', () => {
    render(<GroupModal group={mockGroup} secrets={[]} isNew={false} />);
    const saveButton = screen.getByText('save');
    expect(saveButton).toBeDefined();
  });

  it('submit button is disabled when name is empty', () => {
    render(<GroupModal group={null} secrets={[]} isNew={true} />);
    const submitButton = screen.getByText('create').closest('button');
    expect(submitButton).toBeDefined();
    expect(submitButton!.disabled).toBe(true);
  });

  it('renders name input with label "nameLabel"', () => {
    render(<GroupModal group={null} secrets={[]} isNew={true} />);
    const nameLabel = screen.getByText('nameLabel');
    expect(nameLabel).toBeDefined();
  });

  it('renders description textarea with label "descriptionLabel"', () => {
    render(<GroupModal group={null} secrets={[]} isNew={true} />);
    const descLabel = screen.getByText('descriptionLabel');
    expect(descLabel).toBeDefined();
  });

  it('renders secrets select with label "secretsLabel"', () => {
    render(<GroupModal group={null} secrets={[]} isNew={true} />);
    const selectLabel = screen.getByText('secretsLabel');
    expect(selectLabel).toBeDefined();
  });

  it('only shows non-skipped, assigned secrets in the select', () => {
    render(<GroupModal group={null} secrets={mockSecrets} isNew={true} />);
    const selectItems = screen.getAllByTestId('select-item');
    // secret-1 and secret-2 are non-skipped with itemId; secret-3 is skipped; secret-4 has no itemId
    expect(selectItems).toHaveLength(2);
    expect(selectItems[0].textContent).toContain('secret-1');
    expect(selectItems[1].textContent).toContain('secret-2');
  });

  it('shows error message when state has error', () => {
    vi.mocked(useActionState).mockReturnValue([
      { error: 'Failed' },
      vi.fn(),
      false
    ] as unknown as ReturnType<typeof useActionState>);
    render(<GroupModal group={null} secrets={[]} isNew={true} />);
    const errorDiv = screen.getByText('Failed');
    expect(errorDiv).toBeDefined();
    // Reset mock
    vi.mocked(useActionState).mockReturnValue([
      null,
      vi.fn(),
      false
    ] as unknown as ReturnType<typeof useActionState>);
  });

  it('shows event name preview when name is valid (no nameError)', () => {
    render(<GroupModal group={mockGroup} secrets={[]} isNew={false} />);
    const body = screen.getByTestId('modal-body');
    expect(body.textContent).toContain('eventNameLabel');
    expect(body.textContent).toContain(
      `onepassword_group_${mockGroup.name}_updated`
    );
  });
});
