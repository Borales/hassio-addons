import { CreateGroupButton } from '@/components/group/create-group-button';
import { GroupList } from '@/components/group/group-list';
import { GroupModal } from '@/components/group/group-modal';
import {
  getCachedGroup,
  getCachedGroups,
  getCachedSecrets
} from '@/lib/cached-data';
import { Code } from '@heroui/react';
import Link from 'next/link';

export default async function GroupsPage(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const activeGroupId = searchParams.groupId || '';

  // Fetch groups and secrets in parallel for optimal performance
  const [groups, secrets, activeGroup] = await Promise.all([
    getCachedGroups(),
    getCachedSecrets(),
    activeGroupId && activeGroupId !== 'new'
      ? getCachedGroup(activeGroupId)
      : Promise.resolve(null)
  ]);

  return (
    <>
      {(activeGroupId === 'new' || activeGroup) && (
        <GroupModal
          group={activeGroup}
          secrets={secrets}
          isNew={activeGroupId === 'new'}
        />
      )}

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Event Groups
          </h1>
          <p className="text-default-500 mt-1 text-sm">
            Combine secrets to receive a single event when any secret in the
            group updates
          </p>
        </div>
        <CreateGroupButton />
      </div>

      {/* Info banner */}
      <div className="border-divider bg-default-50 dark:bg-default-100/20 mb-6 rounded-lg border px-4 py-3">
        <p className="text-default-600 dark:text-default-400 text-sm">
          <span className="font-medium">Event format:</span>{' '}
          <Code size="sm" color="primary">
            onepassword_group_&#123;name&#125;_updated
          </Code>
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="border-divider rounded-lg border border-dashed py-16 text-center">
          <p className="text-default-400 text-sm">No groups created yet</p>
          <p className="mt-2">
            <Link
              href="/groups?groupId=new"
              className="text-primary text-sm hover:underline"
            >
              Create your first group →
            </Link>
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="text-default-500 mb-4 text-sm">
            <span className="text-foreground font-medium">{groups.length}</span>{' '}
            {groups.length === 1 ? 'group' : 'groups'}
          </div>
          <GroupList groups={groups} />
        </>
      )}
    </>
  );
}
