// @vitest-environment happy-dom
import { act, renderHook, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deferred } from '../helpers/fixtures';
import { t } from '../helpers/next-intl';

const router = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock('next-intl', () => import('../helpers/next-intl'));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/actions/force-update', () => ({ forceUpdateNow: vi.fn() }));

import { forceUpdateNow } from '@/actions/force-update';
import { ToastProvider } from '@/components/ui/toast-provider';
import { useSync } from '@/hooks/use-sync';

const NOW = new Date('2026-01-01T12:00:00.000Z').getTime();

const inSeconds = (seconds: number) =>
  new Date(NOW + seconds * 1000).toISOString();

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

const setup = (nextUpdate: string | null) =>
  renderHook(() => useSync(nextUpdate), { wrapper });

describe('useSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('clock', () => {
    it.each([
      [125, '2:05'],
      [60, '1:00'],
      [9, '0:09'],
      [0, '0:00'],
      [-30, '0:00']
    ])('formats %i seconds left as %s', (seconds, clock) => {
      const { result } = setup(inSeconds(seconds));
      expect(result.current.clock).toBe(clock);
    });

    it('counts down every second', () => {
      const { result } = setup(inSeconds(61));

      act(() => vi.advanceTimersByTime(2000));

      expect(result.current.clock).toBe('0:59');
    });

    it('shows -:-- before hydration', () => {
      const Probe = () => <>{useSync(inSeconds(60)).clock}</>;

      expect(renderToString(wrapper({ children: <Probe /> }))).toContain(
        '-:--'
      );
    });

    it('shows -:-- and flags it when there was never a sync', () => {
      const { result } = setup(null);

      expect(result.current.clock).toBe('-:--');
      expect(result.current.neverSynced).toBe(true);
    });

    it('is not flagged once a sync is scheduled', () => {
      expect(setup(inSeconds(60)).result.current.neverSynced).toBe(false);
    });
  });

  describe('overdue refresh', () => {
    it('refreshes every 30s once the sync is due', () => {
      setup(inSeconds(0));

      act(() => vi.advanceTimersByTime(29_999));
      expect(router.refresh).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(1));
      expect(router.refresh).toHaveBeenCalledOnce();

      act(() => vi.advanceTimersByTime(30_000));
      expect(router.refresh).toHaveBeenCalledTimes(2);
    });

    it('starts when the countdown reaches zero', () => {
      setup(inSeconds(10));

      act(() => vi.advanceTimersByTime(10_000));
      expect(router.refresh).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(30_000));
      expect(router.refresh).toHaveBeenCalledOnce();
    });

    it('stays idle while the sync is in the future', () => {
      setup(inSeconds(600));

      act(() => vi.advanceTimersByTime(60_000));

      expect(router.refresh).not.toHaveBeenCalled();
    });
  });

  describe('sync', () => {
    it('reports syncing while the action runs', async () => {
      const pending = deferred<{ success: true; changedCount: number }>();
      vi.mocked(forceUpdateNow).mockReturnValue(pending.promise);
      const { result } = setup(inSeconds(60));

      await act(async () => result.current.sync());
      expect(result.current.syncing).toBe(true);

      await act(async () =>
        pending.resolve({ success: true, changedCount: 0 })
      );
      expect(result.current.syncing).toBe(false);
    });

    it('toasts the number of changes on success', async () => {
      vi.mocked(forceUpdateNow).mockResolvedValue({
        success: true,
        changedCount: 3
      });
      const { result } = setup(inSeconds(60));

      await act(async () => result.current.sync());

      expect(screen.getByRole('status').textContent).toBe('syncComplete');
      expect(t).toHaveBeenCalledWith('syncComplete', { count: 3 });
    });

    it('toasts the error on failure', async () => {
      vi.mocked(forceUpdateNow).mockResolvedValue({
        success: false,
        error: 'op is down'
      });
      const { result } = setup(inSeconds(60));

      await act(async () => result.current.sync());

      expect(screen.getByRole('status').textContent).toBe('op is down');
    });

    it('falls back to a generic message without an error', async () => {
      vi.mocked(forceUpdateNow).mockResolvedValue({ success: false });
      const { result } = setup(inSeconds(60));

      await act(async () => result.current.sync());

      expect(screen.getByRole('status').textContent).toBe('syncFailed');
    });
  });
});
