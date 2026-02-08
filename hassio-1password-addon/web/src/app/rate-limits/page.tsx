import { CustomTimeAgo } from '@/components/date-formatter';
import { RateLimitInfo } from '@/components/rate-limit/rate-limit-info';
import { RefreshButton } from '@/components/rate-limit/refresh-button';
import { UsageCard } from '@/components/rate-limit/usage-card';
import { getCachedRateLimits } from '@/lib/cached-data';
import { getTranslations } from 'next-intl/server';

export default async function RateLimitsPage() {
  const t = await getTranslations('rateLimits');
  const data = await getCachedRateLimits();

  if (!data) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-foreground mb-4 text-xl font-semibold">
          {t('title')}
        </h1>
        <p className="text-default-500">{t('noDataYet')}</p>
      </div>
    );
  }

  const { limits, account, timestamp } = data;

  // Fallback for missing account info (should not happen after migration)
  const accountInfo = account ?? {
    tier: 'personal',
    displayName: '1Password'
  };

  return (
    <>
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            {t('title')}
          </h1>
          <p className="text-default-500 mt-1 text-sm">{t('description')}</p>
        </div>
        <RefreshButton />
      </div>

      {/* Info banner */}
      <div className="border-divider bg-default-50 dark:bg-default-100/20 mb-6 rounded-lg border px-4 py-3">
        <p className="text-default-600 dark:text-default-400 text-sm">
          {t('lastUpdated')}: <CustomTimeAgo date={timestamp} />
        </p>
      </div>

      {/* Usage cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <UsageCard
          title={t('daily.title')}
          description={t('daily.description')}
          used={limits.daily.used}
          limit={limits.daily.limit}
          reset={limits.daily.reset}
        />
        <UsageCard
          title={t('hourlyReads.title')}
          description={t('hourlyReads.description')}
          used={limits.hourlyReads.used}
          limit={limits.hourlyReads.limit}
          reset={limits.hourlyReads.reset}
        />
      </div>

      {/* Info section */}
      <RateLimitInfo
        accountName={accountInfo.displayName}
        dailyLimit={limits.daily.limit}
        hourlyReadLimit={limits.hourlyReads.limit}
      />
    </>
  );
}
