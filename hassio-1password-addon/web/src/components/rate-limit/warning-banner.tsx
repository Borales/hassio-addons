'use client';

import { Alert, Button } from '@heroui/react';
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
    <Alert
      color="warning"
      variant="faded"
      className="mb-4"
      title={t('title')}
      description={
        <>
          {warningText} {t('description')}
        </>
      }
      endContent={
        <Link href="/rate-limits" passHref>
          <Button color="warning" size="sm" variant="flat">
            {t('viewDetails')}
          </Button>
        </Link>
      }
    />
  );
};
