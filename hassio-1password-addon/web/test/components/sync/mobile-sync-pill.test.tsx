// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '../../helpers/next-intl';

const sync = vi.hoisted(() => ({
  state: { clock: '4:20', neverSynced: false, syncing: false },
  run: vi.fn()
}));

vi.mock('next-intl', () => import('../../helpers/next-intl'));
vi.mock('@/hooks/use-sync', () => ({
  useSync: () => ({ ...sync.state, sync: sync.run })
}));

import { MobileSyncPill } from '@/components/sync/mobile-sync-pill';

const NEXT = '2026-01-01T12:00:00.000Z';

describe('MobileSyncPill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sync.state = { clock: '4:20', neverSynced: false, syncing: false };
  });

  it('shows the countdown, naming it for screen readers', () => {
    render(<MobileSyncPill nextUpdate={NEXT} />);

    const pill = screen.getByRole('button', { name: 'syncPill' });
    expect(pill.textContent).toBe('4:20');
    expect(t).toHaveBeenCalledWith('syncPill', { time: '4:20' });
  });

  it('asks to sync when it never synced', () => {
    sync.state.neverSynced = true;
    render(<MobileSyncPill nextUpdate={null} />);

    const pill = screen.getByRole('button', { name: 'notSyncedPill' });
    expect(pill.textContent).toBe('syncShort');
  });

  it('shows progress and locks itself while syncing', () => {
    sync.state.syncing = true;
    render(<MobileSyncPill nextUpdate={NEXT} />);

    const pill = screen.getByRole<HTMLButtonElement>('button', {
      name: 'syncing'
    });
    expect(pill.textContent).toBe('syncingShort');
    expect(pill.disabled).toBe(true);
  });

  it('syncs on click', () => {
    render(<MobileSyncPill nextUpdate={NEXT} />);

    fireEvent.click(screen.getByRole('button'));

    expect(sync.run).toHaveBeenCalledOnce();
  });
});
