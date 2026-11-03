'use client';

import { InfoIcon, LockSimpleIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

type RateLimitInfoProps = {
  accountName: string;
  dailyLimit: number;
  hourlyReadLimit: number;
};

export const RateLimitInfo = ({
  accountName,
  dailyLimit,
  hourlyReadLimit
}: RateLimitInfoProps) => {
  const t = useTranslations('rateLimits.info');

  return (
    <div className="rounded-box hairline surface flex gap-4 border p-5">
      <div className="bg-info/15 text-info flex size-9 shrink-0 items-center justify-center rounded-full">
        <InfoIcon size={17} />
      </div>
      <div className="min-w-0 text-[13.5px]">
        <h2 className="font-medium">{t('title')}</h2>
        <p className="text-base-content/70 mt-1 leading-relaxed">
          {t('description')}
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[12.5px]">
          <div className="flex gap-1.5">
            <dt className="text-muted">{t('account')}</dt>
            <dd className="font-medium">{accountName}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted">{t('dailyLimit')}</dt>
            <dd className="font-mono">
              {t('requests', { count: dailyLimit })}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted">{t('hourlyReadLimit')}</dt>
            <dd className="font-mono">
              {t('requests', { count: hourlyReadLimit })}
            </dd>
          </div>
        </dl>
        <p className="text-muted mt-3 flex items-center gap-1.5 text-[12.5px]">
          <LockSimpleIcon size={12} />
          {t('readOnlyNote')}
        </p>
      </div>
    </div>
  );
};
