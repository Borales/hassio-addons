import { CreateFirstGroupLink } from '@/components/group/create-first-group-link';
import { CreateGroupButton } from '@/components/group/create-group-button';
import { GroupList } from '@/components/group/group-list';
import { GroupModalProvider } from '@/components/group/group-modal-provider';
import { GroupModalWrapper } from '@/components/group/group-modal-wrapper';
import { getCachedGroups, getCachedSecrets } from '@/lib/cached-data';
import { Code } from '@heroui/react';
import { getTranslations } from 'next-intl/server';

export default async function GroupsPage() {
  const t = await getTranslations('groups');

  // Fetch groups and secrets in parallel for optimal performance
  const [groups, secrets] = await Promise.all([
    getCachedGroups(),
    getCachedSecrets()
  ]);

  return (
    <GroupModalProvider>
      <GroupModalWrapper secrets={secrets} />

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            {t('title')}
          </h1>
          <p className="text-default-500 mt-1 text-sm">{t('description')}</p>
        </div>
        <CreateGroupButton />
      </div>

      {/* Info banner */}
      <div className="border-divider bg-default-50 dark:bg-default-100/20 mb-6 rounded-lg border px-4 py-3">
        <p className="text-default-600 dark:text-default-400 text-sm">
          <span className="font-medium">{t('eventFormat')}</span>{' '}
          <Code size="sm" color="primary">
            onepassword_group_&#123;name&#125;_updated
          </Code>
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="border-divider rounded-lg border border-dashed py-16 text-center">
          <p className="text-default-400 text-sm">{t('noGroupsYet')}</p>
          <p className="mt-2">
            <CreateFirstGroupLink />
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="text-default-500 mb-4 text-sm">
            <span className="text-foreground font-medium">{groups.length}</span>{' '}
            {t('groupCount', { count: groups.length })}
          </div>
          <GroupList groups={groups} />
        </>
      )}
    </GroupModalProvider>
  );
}
