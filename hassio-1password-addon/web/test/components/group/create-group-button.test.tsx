// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => import('../../helpers/next-intl'));

import { CreateGroupButton } from '@/components/group/create-group-button';
import {
  GroupModalProvider,
  useGroupModal
} from '@/components/group/group-modal-provider';

const ModeProbe = () => <output>{useGroupModal().mode ?? 'closed'}</output>;

describe('CreateGroupButton', () => {
  it('opens the modal in create mode', () => {
    render(
      <GroupModalProvider>
        <CreateGroupButton />
        <ModeProbe />
      </GroupModalProvider>
    );
    expect(screen.getByRole('status').textContent).toBe('closed');

    fireEvent.click(screen.getByRole('button', { name: 'newGroup' }));

    expect(screen.getByRole('status').textContent).toBe('create');
  });
});
