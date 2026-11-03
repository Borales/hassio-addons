// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sync = vi.hoisted(() => ({
  state: { clock: '4:20', neverSynced: false, syncing: false },
  run: vi.fn()
}));

vi.mock('next-intl', () => import('../../helpers/next-intl'));
vi.mock('@/hooks/use-sync', () => ({
  useSync: () => ({ ...sync.state, sync: sync.run })
}));

import { SyncBar } from '@/components/sync/sync-bar';

const NEXT = '2026-01-01T12:00:00.000Z';
const LAST = '2026-01-01T11:00:00.000Z';

const button = () =>
  screen.getByRole<HTMLButtonElement>('button', { name: 'updateNow' });

describe('SyncBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sync.state = { clock: '4:20', neverSynced: false, syncing: false };
  });

  it('shows the countdown and when the last sync ran', () => {
    render(<SyncBar nextUpdate={NEXT} lastSynced={LAST} />);

    expect(screen.getByText('nextSync')).toBeDefined();
    expect(screen.getByText('4:20')).toBeDefined();
    expect(screen.getByText('lastSynced')).toBeDefined();
    expect(screen.getByRole('time').getAttribute('datetime')).toBe(LAST);
  });

  it('leaves out the last sync when there is none', () => {
    render(<SyncBar nextUpdate={NEXT} lastSynced={null} />);

    expect(screen.getByText('nextSync')).toBeDefined();
    expect(screen.queryByText('lastSynced')).toBeNull();
  });

  it('says so when it never synced', () => {
    sync.state.neverSynced = true;
    render(<SyncBar nextUpdate={null} lastSynced={null} />);

    expect(screen.getByText('notSyncedYet')).toBeDefined();
    expect(screen.queryByText('nextSync')).toBeNull();
  });

  it('shows progress and locks the button while syncing', () => {
    sync.state.syncing = true;
    render(<SyncBar nextUpdate={NEXT} lastSynced={LAST} />);

    expect(screen.getByText('syncing')).toBeDefined();
    expect(screen.queryByText('nextSync')).toBeNull();
    expect(button().disabled).toBe(true);
  });

  it('syncs on click', () => {
    render(<SyncBar nextUpdate={NEXT} lastSynced={LAST} />);

    fireEvent.click(button());

    expect(sync.run).toHaveBeenCalledOnce();
  });
});
