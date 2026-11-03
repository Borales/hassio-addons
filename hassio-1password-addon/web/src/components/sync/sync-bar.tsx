'use client';

import { useSync } from '@/hooks/use-sync';
import { ArrowsClockwiseIcon, WarningIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { CustomTimeAgo } from '../date-formatter';

type SyncBarProps = {
  nextUpdate: string | null;
  lastSynced: string | null;
};

/** Desktop sync status, sticky to the bottom of the viewport. */
export const SyncBar = ({ nextUpdate, lastSynced }: SyncBarProps) => {
  const t = useTranslations('home');
  const { clock, neverSynced, syncing, sync } = useSync(nextUpdate);

  return (
    <div className="hairline sticky bottom-0 z-20 mt-6 hidden border-t bg-[color-mix(in_oklab,var(--color-base-100)_88%,transparent)] backdrop-blur md:block">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 px-4 text-[13px] sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5" aria-live="polite">
          {syncing ? (
            <>
              <span className="loading loading-spinner loading-xs text-primary" />
              <span>{t('syncing')}</span>
            </>
          ) : neverSynced ? (
            <>
              <WarningIcon size={14} className="text-warning" />
              <span className="text-unassigned font-medium">
                {t('notSyncedYet')}
              </span>
            </>
          ) : (
            <>
              <span className="relative flex size-2">
                <span className="bg-success absolute inline-flex size-full animate-ping rounded-full opacity-50" />
                <span className="bg-success relative inline-flex size-2 rounded-full" />
              </span>
              <span className="text-base-content/75">
                {t.rich('nextSync', {
                  time: clock,
                  clock: (chunks) => (
                    <span className="text-base-content font-mono tabular-nums">
                      {chunks}
                    </span>
                  )
                })}
              </span>
              {lastSynced && (
                <>
                  <span className="text-base-content/30" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-muted">
                    {t.rich('lastSynced', {
                      time: () => <CustomTimeAgo date={lastSynced} />
                    })}
                  </span>
                </>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={sync}
          disabled={syncing}
          className="btn btn-sm btn-ghost hairline gap-1.5 border"
        >
          <ArrowsClockwiseIcon
            size={14}
            className={syncing ? 'animate-spin' : ''}
          />
          {t('updateNow')}
        </button>
      </div>
    </div>
  );
};
