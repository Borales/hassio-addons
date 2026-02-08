'use client';

import { Card, CardBody, Progress, ProgressProps } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { tv } from 'tailwind-variants';

const progressColor = tv({
  variants: {
    usage: {
      low: 'success',
      medium: 'primary',
      high: 'warning',
      critical: 'danger'
    }
  }
});

interface UsageCardProps {
  title: string;
  description: string;
  used: number;
  limit: number;
  reset: string; // ISO timestamp when limit resets
}

export const UsageCard = ({
  title,
  description,
  used,
  limit,
  reset
}: UsageCardProps) => {
  const t = useTranslations('rateLimits.card');
  const [secondsUntilReset, setSecondsUntilReset] = useState<number>(0);

  const rawPercentage = limit > 0 ? (used / limit) * 100 : 0;
  const percentage = Math.min(100, Math.max(0, rawPercentage));

  const usageLevel =
    percentage >= 90
      ? 'critical'
      : percentage >= 75
        ? 'high'
        : percentage >= 50
          ? 'medium'
          : 'low';

  const color = progressColor({ usage: usageLevel }) as ProgressProps['color'];

  // Update countdown every minute
  useEffect(() => {
    const calculateSecondsUntilReset = (): number => {
      if (!reset) return 0;
      const resetTime = new Date(reset).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((resetTime - now) / 1000));
    };

    const updateCountdown = () => {
      setSecondsUntilReset(calculateSecondsUntilReset());
    };

    // Initial calculation
    updateCountdown();

    // Update every 60 seconds
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [reset]);

  // Format reset time
  const formatResetTime = (seconds: number): string => {
    if (seconds === 0) return t('noReset');

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return t('resetsInHours', { hours, minutes });
    }
    return t('resetsInMinutes', { minutes: Math.max(1, minutes) });
  };

  return (
    <Card>
      <CardBody className="gap-4">
        <div>
          <h3 className="text-foreground text-lg font-semibold">{title}</h3>
          <p className="text-default-500 text-sm">{description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-default-500 text-sm">{t('usage')}</span>
            <span className="text-foreground text-2xl font-bold">
              {used.toLocaleString()}
              <span className="text-default-400 ml-1 text-base font-normal">
                / {limit.toLocaleString()}
              </span>
            </span>
          </div>

          <Progress
            value={percentage}
            color={color}
            size="md"
            className="w-full"
            aria-label={t('progressLabel', {
              title,
              percentage: percentage.toFixed(1)
            })}
          />

          <div className="flex items-center justify-between">
            <span className="text-default-400 text-xs">
              {t('percentUsed', { percent: percentage.toFixed(1) })}
            </span>
            <span className="text-default-400 text-xs">
              {t('remaining', { count: limit - used })}
            </span>
          </div>

          {secondsUntilReset > 0 && (
            <div className="border-divider bg-default-50 dark:bg-default-100/20 rounded-md border px-3 py-2">
              <p className="text-default-500 text-xs">
                {formatResetTime(secondsUntilReset)}
              </p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
