import { CustomTimeAgo } from '@/components/date-formatter';
import { HASecretList } from '@/components/ha-secret/secret-list';
import { HASecretModal } from '@/components/ha-secret/secret-modal';
import { UpdateNowBtn } from '@/components/update-now';
import {
  getCachedGroups,
  getCachedNextUpdate,
  getCachedOpItems,
  getCachedSecret,
  getCachedSecrets
} from '@/lib/cached-data';
import { Code } from '@heroui/react';

export default async function Home(props: PageProps<'/'>) {
  const searchParams = await props.searchParams;
  const page: number = Number(searchParams.page || 1);
  const activeSecretId = (searchParams.secretId || '') as string;

  // Fetch all data in parallel for optimal performance
  const [nextUpdate, [items], secrets, allGroups, activeSecret] =
    await Promise.all([
      getCachedNextUpdate(),
      getCachedOpItems({ pagination: { page, limit: 1000 } }),
      getCachedSecrets(),
      getCachedGroups(),
      activeSecretId
        ? getCachedSecret(activeSecretId)
        : Promise.resolve(undefined)
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
    <>
      {activeSecret && (
        <HASecretModal activeSecret={activeSecret} opItems={items || []} />
      )}

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-foreground text-xl font-semibold">
          Home Assistant Secrets
        </h1>
        <p className="text-default-500 mt-1 text-sm">
          Manage and sync your secrets from 1Password to Home Assistant{' '}
          <Code>secrets.yaml</Code>
        </p>
      </div>

      <HASecretList items={secretsWithGroups} />

      {/* Footer status bar */}
      <div className="border-divider bg-default-50 dark:bg-default-100/20 flex items-center justify-between rounded-lg border px-4 py-3">
        <span className="text-default-500 text-sm">
          {nextUpdate && (
            <>
              Next sync: <CustomTimeAgo date={nextUpdate} />
            </>
          )}
          {!nextUpdate && (
            <span className="text-warning-500">Not synced yet</span>
          )}
        </span>
        <UpdateNowBtn />
      </div>
    </>
  );
}
