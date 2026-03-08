// @vitest-environment happy-dom

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

vi.mock('@/actions/refresh-op-secret', () => ({
  fetchOpItemFields: vi.fn().mockResolvedValue({ success: false })
}));

vi.mock('@/service/1password.service', () => ({}));

vi.mock('@/components/ha-secret/secret-modal-provider', () => ({
  useSecretModal: vi.fn(() => ({ closeModal: vi.fn() }))
}));

vi.mock('@/components/ha-secret/secret-modal-field-list', () => ({
  HASecretModalFieldList: () => <div data-testid="field-list" />
}));

vi.mock('@/components/ha-secret/secret-modal-save', () => ({
  HASecretModalSave: () => <div data-testid="modal-save" />
}));

vi.mock('@/components/op-secret/secret-icon', () => ({
  OpSecretIcon: () => <div data-testid="op-icon" />
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
    <div>{typeof children === 'function' ? children(vi.fn()) : children}</div>
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
  Autocomplete: ({
    children,
    label,
    defaultItems
  }: {
    children: (item: unknown) => React.ReactNode;
    label: string;
    defaultItems?: unknown[];
  }) => (
    <div data-testid="autocomplete" data-label={label}>
      {Array.isArray(defaultItems) ? defaultItems.map(children) : null}
    </div>
  ),
  AutocompleteItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="autocomplete-item">{children}</div>
  ),
  Code: ({ children }: { children: React.ReactNode }) => (
    <code data-testid="code">{children}</code>
  ),
  Spinner: ({ label }: { label: string }) => (
    <div data-testid="spinner" data-label={label} />
  )
}));

import { HASecretModal } from '@/components/ha-secret/secret-modal';
import type { OpItem } from '@/service/1password.service';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const mockOpItems = [
  {
    id: 'op-item-1',
    title: 'Item One',
    vaultId: 'vault-1',
    additionalInfo: 'info1',
    urls: [],
    fields: []
  },
  {
    id: 'op-item-2',
    title: 'Item Two',
    vaultId: 'vault-2',
    additionalInfo: null,
    urls: [],
    fields: []
  }
] as unknown as OpItem[];

const mockActiveSecret = {
  id: 'ha-secret-1',
  isSkipped: false,
  itemId: '',
  updatedAt: new Date(),
  reference: ''
};

const mockActiveSecretWithItem = {
  id: 'ha-secret-2',
  isSkipped: false,
  itemId: 'op-item-1',
  updatedAt: new Date(),
  reference: 'op://vault-1/item-1/field'
};

describe('HASecretModal', () => {
  it('renders null (modal closed) when activeSecret is null', () => {
    const { container } = render(
      <HASecretModal activeSecret={null} opItems={mockOpItems} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when activeSecret is provided', () => {
    render(
      <HASecretModal activeSecret={mockActiveSecret} opItems={mockOpItems} />
    );
    const modal = screen.getByTestId('modal');
    expect(modal).toBeDefined();
  });

  it('renders the modal header with "title" translation and secret id', () => {
    render(
      <HASecretModal activeSecret={mockActiveSecret} opItems={mockOpItems} />
    );
    const header = screen.getByTestId('modal-header');
    expect(header).toBeDefined();
    expect(header.textContent).toContain('title');
    expect(header.textContent).toContain(mockActiveSecret.id);
  });

  it('renders the Autocomplete with "searchLabel" label', () => {
    render(
      <HASecretModal activeSecret={mockActiveSecret} opItems={mockOpItems} />
    );
    const autocomplete = screen.getByTestId('autocomplete');
    expect(autocomplete).toBeDefined();
    expect(autocomplete.getAttribute('data-label')).toBe('searchLabel');
  });

  it('renders autocomplete items for each opItem', () => {
    render(
      <HASecretModal activeSecret={mockActiveSecret} opItems={mockOpItems} />
    );
    const items = screen.getAllByTestId('autocomplete-item');
    expect(items).toHaveLength(mockOpItems.length);
    expect(items[0].textContent).toContain('Item One');
    expect(items[1].textContent).toContain('Item Two');
  });

  it('renders HASecretModalSave in the footer', () => {
    render(
      <HASecretModal activeSecret={mockActiveSecret} opItems={mockOpItems} />
    );
    const footer = screen.getByTestId('modal-footer');
    expect(footer).toBeDefined();
    const modalSave = screen.getByTestId('modal-save');
    expect(modalSave).toBeDefined();
  });

  it('does NOT show spinner initially (isLoadingFields=false)', () => {
    render(
      <HASecretModal activeSecret={mockActiveSecret} opItems={mockOpItems} />
    );
    const spinner = screen.queryByTestId('spinner');
    expect(spinner).toBeNull();
  });

  it('does NOT show field list when no item is selected (opSecretId="")', () => {
    render(
      <HASecretModal activeSecret={mockActiveSecret} opItems={mockOpItems} />
    );
    const fieldList = screen.queryByTestId('field-list');
    expect(fieldList).toBeNull();
  });

  it('shows field list when an item is pre-selected via activeSecret.itemId', async () => {
    const { fetchOpItemFields } = await import('@/actions/refresh-op-secret');
    vi.mocked(fetchOpItemFields).mockResolvedValue({
      success: false
    } as Awaited<ReturnType<typeof fetchOpItemFields>>);

    const { findByTestId } = render(
      <HASecretModal
        activeSecret={mockActiveSecretWithItem}
        opItems={mockOpItems}
      />
    );

    // After the effect runs and fetchOpItemFields resolves with success:false,
    // selectedOpItem is set from opItems.find(), so field list should appear
    const fieldList = await findByTestId('field-list');
    expect(fieldList).toBeDefined();
  });
});
