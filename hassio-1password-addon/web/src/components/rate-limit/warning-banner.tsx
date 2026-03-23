'use client';

import { Alert, Button } from '@heroui/react';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface RateLimitWarningBannerProps {
  warnings: string[];
}

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
    <Alert status="warning" className="mb-4 items-center">
      <Alert.Indicator>
        <WarningCircleIcon size={24} weight="bold" />
      </Alert.Indicator>
      <Alert.Content>
        <Alert.Title>{t('title')}</Alert.Title>
        <Alert.Description>
          {warningText} {t('description')}
        </Alert.Description>
      </Alert.Content>
      <Link href="./rate-limits" passHref>
        <Button size="sm" variant="tertiary">
          {t('viewDetails')}
        </Button>
      </Link>
    </Alert>
  );
};
