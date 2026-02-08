'use client';

import { Alert } from '@heroui/react';
import { useTranslations } from 'next-intl';

interface RateLimitInfoProps {
  accountName: string;
  dailyLimit: number;
  hourlyReadLimit: number;
}

export const RateLimitInfo = ({
  accountName,
  dailyLimit,
  hourlyReadLimit
}: RateLimitInfoProps) => {
  const t = useTranslations('rateLimits.info');

  return (
    <Alert
      color="default"
      variant="faded"
      className="mt-6"
      title={t('title')}
      description={
        <>
          <p className="mb-3">{t('description')}</p>
          <p>
            <span className="text-foreground font-semibold">{accountName}</span>{' '}
            • {t('dailyLimit')}:{' '}
            <span className="text-foreground font-semibold">
              {t('requests', { count: dailyLimit })}
            </span>{' '}
            • {t('hourlyReadLimit')}:{' '}
            <span className="text-foreground font-semibold">
              {t('requests', { count: hourlyReadLimit })}
            </span>
          </p>
          <p className="text-default-500 mt-2 text-xs italic">
            {t('readOnlyNote')}
          </p>
        </>
      }
    />
  );
};
