'use client';

import { useNow } from '@/hooks/use-now';
import { ClockIcon } from '@phosphor-icons/react';
import { useFormatter, useTranslations } from 'next-intl';

const usageStyles = {
  // Calm until it needs attention: color only appears from 75%.
  low: { progress: 'text-base-content/45', badge: '' },
  high: { progress: 'progress-warning', badge: 'badge-warning' },
  critical: { progress: 'progress-error', badge: 'badge-error' }
} as const;

const getUsageLevel = (percentage: number): keyof typeof usageStyles => {
  if (percentage >= 90) return 'critical';
  return percentage >= 75 ? 'high' : 'low';
};

type UsageCardProps = {
  title: string;
  description: string;
  used: number;
  limit: number;
  reset: string; // ISO timestamp when limit resets
};

const MINUTE_MS = 60_000;

export const UsageCard = ({
  title,
  description,
  used,
  limit,
  reset
}: UsageCardProps) => {
  const t = useTranslations('rateLimits.card');
  const format = useFormatter();
  const now = useNow(MINUTE_MS);

  const rawPercentage = limit > 0 ? (used / limit) * 100 : 0;
  const percentage = Math.min(100, Math.max(0, rawPercentage));
  const level = getUsageLevel(percentage);

  const resetLabel = () => {
    const seconds = reset
      ? Math.max(0, Math.floor((new Date(reset).getTime() - (now ?? 0)) / 1000))
      : 0;
    if (seconds === 0) return t('noReset');

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return hours > 0
      ? t('resetsInHours', { hours, minutes })
      : t('resetsInMinutes', { minutes: Math.max(1, minutes) });
  };

  return (
    <section
      className="rounded-box hairline surface border p-5"
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold">
            {title}
            {level !== 'low' && (
              <span
                className={`badge badge-sm badge-soft ${usageStyles[level].badge}`}
              >
                {level === 'critical' ? t('nearLimit') : t('high')}
              </span>
            )}
          </h2>
          <p className="text-muted mt-0.5 text-[12.5px]">{description}</p>
        </div>
        <div className="text-right text-[24px] leading-none font-semibold whitespace-nowrap tabular-nums">
          {format.number(used)}
          <span className="text-muted text-[14px] font-normal">
            {' '}
            / {format.number(limit)}
          </span>
        </div>
      </div>

      <progress
        className={`progress mt-5 h-2 w-full ${usageStyles[level].progress}`}
        value={percentage}
        max={100}
        aria-label={t('progressLabel', {
          title,
          percentage: percentage.toFixed(1)
        })}
      />

      <div className="text-muted mt-2 flex items-center justify-between text-[12px] tabular-nums">
        <span>{t('percentUsed', { percent: percentage.toFixed(1) })}</span>
        <span>{t('remaining', { count: Math.max(0, limit - used) })}</span>
      </div>

      <div className="hairline text-muted mt-4 flex items-center gap-1.5 border-t pt-3 text-[12px]">
        <ClockIcon size={12} />
        {/* The countdown is client-only so server and client markup agree */}
        {now === null ? ' ' : resetLabel()}
      </div>
    </section>
  );
};
