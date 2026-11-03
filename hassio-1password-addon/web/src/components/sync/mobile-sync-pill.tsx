'use client';

import { useSync } from '@/hooks/use-sync';
import { ArrowsClockwiseIcon, WarningIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

/** Phones: sync status lives in the top bar instead of a second sticky bar. */
export const MobileSyncPill = ({
  nextUpdate
}: {
  nextUpdate: string | null;
}) => {
  const t = useTranslations('home');
  const { clock, neverSynced, syncing, sync } = useSync(nextUpdate);

  const label = syncing
    ? t('syncing')
    : neverSynced
      ? t('notSyncedPill')
      : t('syncPill', { time: clock });

  return (
    <button
      type="button"
      onClick={sync}
      disabled={syncing}
      aria-label={label}
      title={label}
      className="btn btn-sm btn-ghost hairline gap-1.5 border px-2.5 font-normal md:hidden"
    >
      {syncing ? (
        <span className="loading loading-spinner loading-xs text-primary" />
      ) : neverSynced ? (
        <WarningIcon size={14} className="text-warning" />
      ) : (
        <span className="bg-success size-1.5 rounded-full" />
      )}
      {syncing ? (
        <span className="text-[12px]">{t('syncingShort')}</span>
      ) : neverSynced ? (
        <span className="text-unassigned text-[12px] font-medium">
          {t('syncShort')}
        </span>
      ) : (
        <>
          <span className="font-mono text-[12px] tabular-nums">{clock}</span>
          <ArrowsClockwiseIcon size={13} className="text-muted" />
        </>
      )}
    </button>
  );
};
