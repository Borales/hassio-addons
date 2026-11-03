import { CustomTimeAgo } from '@/components/date-formatter';
import { RateLimitInfo } from '@/components/rate-limit/rate-limit-info';
import { RefreshButton } from '@/components/rate-limit/refresh-button';
import { UsageCard } from '@/components/rate-limit/usage-card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer, PageHeader } from '@/components/ui/page';
import { getCachedRateLimits } from '@/lib/cached-data';
import { GaugeIcon } from '@phosphor-icons/react/dist/ssr';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('menu');
  return { title: t('rateLimits') };
}

export default async function RateLimitsPage() {
  const t = await getTranslations('rateLimits');
  const data = await getCachedRateLimits();

  if (!data) {
    return (
      <PageContainer>
        <PageHeader title={t('title')} description={t('description')} />
        <EmptyState icon={GaugeIcon} title={t('noDataTitle')}>
          {t('noDataYet')}
        </EmptyState>
      </PageContainer>
    );
  }

  const { limits, account, timestamp } = data;

  // Fallback for missing account info (should not happen after migration)
  const accountInfo = account ?? {
    tier: 'personal',
    displayName: '1Password'
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <>
            <span className="text-muted text-[12.5px] whitespace-nowrap tabular-nums">
              {t.rich('checked', {
                time: () => <CustomTimeAgo date={timestamp} />
              })}
            </span>
            <RefreshButton />
          </>
        }
      />

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

        <RateLimitInfo
          accountName={accountInfo.displayName}
          dailyLimit={limits.daily.limit}
          hourlyReadLimit={limits.hourlyReads.limit}
        />
      </div>
    </PageContainer>
  );
}
