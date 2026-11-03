'use client';

import { WarningIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type RateLimitWarningBannerProps = {
  warnings: string[];
};

export const RateLimitWarningBanner = ({
  warnings
}: RateLimitWarningBannerProps) => {
  const t = useTranslations('rateLimits.warning');

  if (warnings.length === 0) {
    return null;
  }

  const warningLabels: Record<string, string> = {
    daily: t('labels.daily'),
    hourlyReads: t('labels.hourlyReads')
  };

  const warningText = warnings.map((w) => warningLabels[w] || w).join(', ');

  return (
    <div
      className="alert alert-warning alert-soft text-base-content mt-5"
      role="alert"
    >
      <WarningIcon size={20} className="text-unassigned" />
      <div>
        <h3 className="text-unassigned font-semibold">{t('title')}</h3>
        <div className="mt-0.5 text-[13px] opacity-85">
          {t('description', { limits: warningText })}
        </div>
      </div>
      <Link
        href="./rate-limits"
        prefetch={false}
        className="btn btn-sm btn-ghost"
      >
        {t('viewDetails')}
      </Link>
    </div>
  );
};
