// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    onPress,
    onClick,
    startContent
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    onClick?: () => void;
    startContent?: React.ReactNode;
  }) => (
    <button onClick={onPress || onClick}>
      {startContent}
      {children}
    </button>
  )
}));

vi.mock('@phosphor-icons/react', () => ({
  PlusIcon: () => <svg data-testid="plus-icon" />
}));

vi.mock('@/components/group/group-modal-provider', () => ({
  useGroupModal: vi.fn(() => ({ openCreateModal: vi.fn() }))
}));

import { CreateGroupButton } from '@/components/group/create-group-button';
import { useGroupModal } from '@/components/group/group-modal-provider';

describe('CreateGroupButton', () => {
  it('renders a button with translated label "newGroup"', () => {
    render(<CreateGroupButton />);
    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    expect(button.textContent).toContain('newGroup');
  });

  it('calls openCreateModal when clicked', () => {
    const openCreateModal = vi.fn();

    vi.mocked(useGroupModal).mockReturnValue({ openCreateModal } as any);

    render(<CreateGroupButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(openCreateModal).toHaveBeenCalledTimes(1);
  });

  it('renders the PlusIcon', () => {
    render(<CreateGroupButton />);
    const icon = screen.getByTestId('plus-icon');
    expect(icon).toBeDefined();
  });
});
