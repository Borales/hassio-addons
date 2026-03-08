// @vitest-environment happy-dom
vi.mock('@/components/group/group-modal-provider', () => ({
  useGroupModal: vi.fn()
}));

vi.mock('@/components/group/group-modal', () => ({
  GroupModal: ({
    group,
    secrets,
    isNew
  }: {
    group: any;
    secrets: any[];
    isNew: boolean;
  }) => (
    <div
      data-testid="group-modal"
      data-is-new={String(isNew)}
      data-secrets-count={secrets?.length}
      data-group-id={group?.id ?? 'null'}
    />
  )
}));

vi.mock('@prisma-generated/client', () => ({}));

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGroupModal } from '@/components/group/group-modal-provider';
import { GroupModalWrapper } from '@/components/group/group-modal-wrapper';

const mockSecrets = [
  { id: 'secret-1', name: 'Secret 1' },
  { id: 'secret-2', name: 'Secret 2' }
] as any[];

const mockGroup = {
  id: 'group-1',
  name: 'Test Group',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  secrets: []
} as any;

describe('GroupModalWrapper', () => {
  it('renders null when mode is null', () => {
    vi.mocked(useGroupModal).mockReturnValue({
      activeGroup: null,
      mode: null,
      openCreateModal: vi.fn(),
      openEditModal: vi.fn(),
      closeModal: vi.fn()
    });

    const { container } = render(<GroupModalWrapper secrets={mockSecrets} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders GroupModal when mode is create with isNew=true', () => {
    vi.mocked(useGroupModal).mockReturnValue({
      activeGroup: null,
      mode: 'create',
      openCreateModal: vi.fn(),
      openEditModal: vi.fn(),
      closeModal: vi.fn()
    });

    render(<GroupModalWrapper secrets={mockSecrets} />);
    const modal = screen.getByTestId('group-modal');
    expect(modal).toBeDefined();
    expect(modal.getAttribute('data-is-new')).toBe('true');
  });

  it('renders GroupModal when mode is edit with isNew=false', () => {
    vi.mocked(useGroupModal).mockReturnValue({
      activeGroup: mockGroup,
      mode: 'edit',
      openCreateModal: vi.fn(),
      openEditModal: vi.fn(),
      closeModal: vi.fn()
    });

    render(<GroupModalWrapper secrets={mockSecrets} />);
    const modal = screen.getByTestId('group-modal');
    expect(modal).toBeDefined();
    expect(modal.getAttribute('data-is-new')).toBe('false');
  });

  it('passes secrets to GroupModal', () => {
    vi.mocked(useGroupModal).mockReturnValue({
      activeGroup: null,
      mode: 'create',
      openCreateModal: vi.fn(),
      openEditModal: vi.fn(),
      closeModal: vi.fn()
    });

    render(<GroupModalWrapper secrets={mockSecrets} />);
    const modal = screen.getByTestId('group-modal');
    expect(modal.getAttribute('data-secrets-count')).toBe('2');
  });
});
