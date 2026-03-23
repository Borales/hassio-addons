'use client';

import { Alert } from '@heroui/react';
import { WarningCircleIcon } from '@phosphor-icons/react';
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
    <Alert status="default" className="mt-6 items-center">
      <Alert.Indicator>
        <WarningCircleIcon size={32} weight="bold" />
      </Alert.Indicator>
      <Alert.Content>
        <Alert.Title>{t('title')}</Alert.Title>
        <Alert.Description>
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
        </Alert.Description>
      </Alert.Content>
    </Alert>
  );
};
