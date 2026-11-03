import { forceUpdateNow } from '@/actions/force-update';
import { useToast } from '@/components/ui/toast-provider';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { useNow } from './use-now';

const OVERDUE_REFRESH_MS = 30_000;

const formatClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/** Countdown to the next scheduled sync, plus the "sync now" action. */
export const useSync = (nextUpdate: string | null) => {
  const t = useTranslations('toast');
  const toast = useToast();
  const router = useRouter();
  const now = useNow();
  const [syncing, startSync] = useTransition();

  const secondsLeft =
    nextUpdate && now !== null
      ? Math.max(0, Math.floor((new Date(nextUpdate).getTime() - now) / 1000))
      : null;
  const overdue = secondsLeft === 0;

  // The scheduled sync runs on the server; pick up its new time once it's due.
  useEffect(() => {
    if (!overdue) return;
    const timer = setInterval(() => router.refresh(), OVERDUE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [overdue, router]);

  const sync = () =>
    startSync(async () => {
      const result = await forceUpdateNow();
      if (result.success) {
        toast({ text: t('syncComplete', { count: result.changedCount }) });
      } else {
        toast({ text: result.error ?? t('syncFailed'), tone: 'error' });
      }
    });

  return {
    clock: secondsLeft === null ? '-:--' : formatClock(secondsLeft),
    neverSynced: !nextUpdate,
    syncing,
    sync
  };
};
