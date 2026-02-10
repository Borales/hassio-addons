import { CustomTimeAgo } from '@/components/date-formatter';
import { HASecretList } from '@/components/ha-secret/secret-list';
import { SecretModalProvider } from '@/components/ha-secret/secret-modal-provider';
import { SecretModalWrapper } from '@/components/ha-secret/secret-modal-wrapper';
import { RateLimitWarningBanner } from '@/components/rate-limit/warning-banner';
import { ServiceAccountWarning } from '@/components/service-account-warning';
import { UpdateNowBtn } from '@/components/update-now';
import {
  getCachedGroups,
  getCachedNextUpdate,
  getCachedOpItems,
  getCachedRateLimitWarning,
  getCachedSecrets
} from '@/lib/cached-data';
import { Code } from '@heroui/react';
import { getTranslations } from 'next-intl/server';

export default async function Home(props: PageProps<'/'>) {
  const searchParams = await props.searchParams;
  const page: number = Number(searchParams.page || 1);

  const t = await getTranslations('home');

  // Check if service account token is configured
  const hasServiceAccountToken = !!process.env.OP_SERVICE_ACCOUNT_TOKEN;

  // Fetch all data in parallel for optimal performance
  const [nextUpdate, [items], secrets, allGroups, rateLimitWarning] =
    await Promise.all([
      getCachedNextUpdate(),
      getCachedOpItems({ pagination: { page, limit: 1000 } }),
      getCachedSecrets(),
      getCachedGroups(),
      getCachedRateLimitWarning()
    ]);

  // Build a map of secretId -> groups for quick lookup
  const secretGroupsMap = new Map<
    string,
    Array<{ id: string; name: string }>
  >();
  for (const group of allGroups) {
    for (const sg of group.secrets) {
      const existing = secretGroupsMap.get(sg.secretId) || [];
      existing.push({ id: group.id, name: group.name });
      secretGroupsMap.set(sg.secretId, existing);
    }
  }

  // Enrich secrets with their groups
  const secretsWithGroups = secrets.map((secret) => ({
    ...secret,
    groups: secretGroupsMap.get(secret.id) || []
  }));

  return (
    <SecretModalProvider>
      {!hasServiceAccountToken && <ServiceAccountWarning />}

      {rateLimitWarning.shouldShow && (
        <RateLimitWarningBanner warnings={rateLimitWarning.warnings} />
      )}

      <SecretModalWrapper opItems={items || []} />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-foreground text-xl font-semibold">{t('title')}</h1>
        <p className="text-default-500 mt-1 text-sm">
          {t('description')} <Code>secrets.yaml</Code>
        </p>
      </div>

      <HASecretList items={secretsWithGroups} />

      {/* Footer status bar */}
      <div className="border-divider bg-default-50 dark:bg-default-100/20 flex items-center justify-between rounded-lg border px-4 py-3">
        <span className="text-default-500 text-sm">
          {nextUpdate && (
            <>
              {t('nextSync')} <CustomTimeAgo date={nextUpdate} />
            </>
          )}
          {!nextUpdate && (
            <span className="text-warning-500">{t('notSyncedYet')}</span>
          )}
        </span>
        <UpdateNowBtn />
      </div>
    </SecretModalProvider>
  );
}
