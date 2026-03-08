// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

vi.mock('@/components/group/group-modal-provider', () => ({
  useGroupModal: vi.fn(() => ({ openCreateModal: vi.fn() }))
}));

import { CreateFirstGroupLink } from '@/components/group/create-first-group-link';
import { useGroupModal } from '@/components/group/group-modal-provider';

describe('CreateFirstGroupLink', () => {
  it('renders a button with translated label "createFirstGroup"', () => {
    render(<CreateFirstGroupLink />);
    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    expect(button.textContent).toBe('createFirstGroup');
  });

  it('calls openCreateModal when clicked', () => {
    const openCreateModal = vi.fn();
     
    vi.mocked(useGroupModal).mockReturnValue({ openCreateModal } as any);

    render(<CreateFirstGroupLink />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(openCreateModal).toHaveBeenCalledTimes(1);
  });

  it('button has correct CSS classes', () => {
    render(<CreateFirstGroupLink />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('text-primary');
    expect(button.className).toContain('text-sm');
    expect(button.className).toContain('hover:underline');
  });
});
