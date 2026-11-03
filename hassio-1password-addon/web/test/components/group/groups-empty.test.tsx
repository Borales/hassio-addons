// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => import('../../helpers/next-intl'));

import {
  GroupModalProvider,
  useGroupModal
} from '@/components/group/group-modal-provider';
import { GroupsEmpty } from '@/components/group/groups-empty';

const ModeProbe = () => <output>{useGroupModal().mode ?? 'closed'}</output>;

describe('GroupsEmpty', () => {
  it('explains groups with an example event, and offers to create one', () => {
    const { container } = render(
      <GroupModalProvider>
        <GroupsEmpty />
        <ModeProbe />
      </GroupModalProvider>
    );

    expect(screen.getByText('noGroupsYet')).toBeDefined();
    expect(container.textContent).toContain(
      'onepassword_group_my_service_updated'
    );

    fireEvent.click(screen.getByRole('button', { name: 'newGroup' }));

    expect(screen.getByRole('status').textContent).toBe('create');
  });
});
