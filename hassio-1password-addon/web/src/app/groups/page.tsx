import { CreateGroupButton } from '@/components/group/create-group-button';
import { GroupList } from '@/components/group/group-list';
import { GroupModalProvider } from '@/components/group/group-modal-provider';
import { GroupModalWrapper } from '@/components/group/group-modal-wrapper';
import { GroupsEmpty } from '@/components/group/groups-empty';
import { PageContainer, PageHeader } from '@/components/ui/page';
import {
  getCachedGroups,
  getCachedOpItems,
  getCachedSecrets
} from '@/lib/cached-data';
import { buildSecretRows } from '@/lib/secret-status';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('menu');
  return { title: t('groups') };
}

export default async function GroupsPage() {
  const t = await getTranslations('groups');

  // Fetch everything in parallel for optimal performance
  const [groups, secrets, [items]] = await Promise.all([
    getCachedGroups(),
    getCachedSecrets(),
    getCachedOpItems({ pagination: { page: 1, limit: 1000 } })
  ]);

  const rows = buildSecretRows(secrets, items);

  return (
    <GroupModalProvider>
      <GroupModalWrapper
        secrets={rows}
        groupNames={groups.map(({ name }) => name)}
      />

      <PageContainer>
        <PageHeader
          title={t('title')}
          description={t('description')}
          actions={groups.length > 0 && <CreateGroupButton />}
        />

        {groups.length === 0 ? (
          <GroupsEmpty />
        ) : (
          <GroupList groups={groups} secrets={rows} />
        )}
      </PageContainer>
    </GroupModalProvider>
  );
}
