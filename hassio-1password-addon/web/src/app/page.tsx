import { HASecretList } from '@/components/ha-secret/secret-list';
import { SecretModalProvider } from '@/components/ha-secret/secret-modal-provider';
import { SecretModalWrapper } from '@/components/ha-secret/secret-modal-wrapper';
import { RateLimitWarningBanner } from '@/components/rate-limit/warning-banner';
import { ServiceAccountWarning } from '@/components/service-account-warning';
import { SyncBar } from '@/components/sync/sync-bar';
import { PageContainer } from '@/components/ui/page';
import { siteConfig } from '@/config/site';
import {
  getCachedGroups,
  getCachedLastSync,
  getCachedNextUpdate,
  getCachedOpItems,
  getCachedRateLimitWarning,
  getCachedSecrets
} from '@/lib/cached-data';
import { buildSecretRows } from '@/lib/secret-status';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('menu');
  // The layout's title template doesn't apply to a page in its own segment
  return { title: { absolute: `${t('secrets')} - ${siteConfig.name}` } };
}

export default async function Home(props: PageProps<'/'>) {
  const searchParams = await props.searchParams;
  const page: number = Number(searchParams.page || 1);

  // Check if service account token is configured
  const hasServiceAccountToken = !!process.env.OP_SERVICE_ACCOUNT_TOKEN;

  // Fetch all data in parallel for optimal performance
  const [nextUpdate, lastSync, [items], secrets, groups, rateLimitWarning] =
    await Promise.all([
      getCachedNextUpdate(),
      getCachedLastSync(),
      getCachedOpItems({ pagination: { page, limit: 1000 } }),
      getCachedSecrets(),
      getCachedGroups(),
      getCachedRateLimitWarning()
    ]);

  const rows = buildSecretRows(secrets, items, groups);

  return (
    <SecretModalProvider>
      <SecretModalWrapper opItems={items || []} />

      <PageContainer>
        <HASecretList
          items={rows}
          serviceAccountBanner={
            !hasServiceAccountToken && <ServiceAccountWarning />
          }
          rateLimitBanner={
            rateLimitWarning.shouldShow && (
              <RateLimitWarningBanner warnings={rateLimitWarning.warnings} />
            )
          }
        />
      </PageContainer>

      {rows.length > 0 && (
        <SyncBar nextUpdate={nextUpdate} lastSynced={lastSync} />
      )}
    </SecretModalProvider>
  );
}
