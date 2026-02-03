'use client';

import { deleteGroup } from '@/actions/group-delete';
import { GroupWithSecrets } from '@/types/group';
import {
  Button,
  Chip,
  Code,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from '@heroui/react';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { Key, memo, useCallback, useTransition } from 'react';
import { ActionButtons } from '../ui/action-buttons';
import { ChipList } from '../ui/chip-list';

type GroupListProps = {
  groups: GroupWithSecrets[];
};

const COLUMNS = [
  { key: 'name', label: 'Group Name' },
  { key: 'secrets', label: 'Linked Secrets' },
  { key: 'event', label: 'Event Name' },
  { key: 'actions', label: 'Actions' }
];

export const GroupList = ({ groups }: GroupListProps) => {
  return (
    <Table aria-label="Groups" removeWrapper>
      <TableHeader columns={COLUMNS}>
        {(column) => (
          <TableColumn
            key={column.key}
            align={column.key === 'actions' ? 'end' : 'start'}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={groups}>
        {(group) => (
          <TableRow key={group.id}>
            {(columnKey) => (
              <TableCell>{renderCell(group, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

function renderCell(group: GroupWithSecrets, columnKey: Key) {
  switch (columnKey) {
    case 'name':
      return <GroupNameCell group={group} />;
    case 'secrets':
      return <LinkedSecretsCell secrets={group.secrets} />;
    case 'event':
      return <EventNameCell groupName={group.name} />;
    case 'actions':
      return <GroupActionsCell group={group} />;
    default:
      return null;
  }
}

const GroupNameCell = memo(({ group }: { group: GroupWithSecrets }) => {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-medium">{group.name}</span>
        {group.description && (
          <Tooltip content={group.description} placement="top">
            <span className="text-default-300 cursor-help text-xs">ⓘ</span>
          </Tooltip>
        )}
      </div>
    </div>
  );
});

GroupNameCell.displayName = 'GroupNameCell';

const LinkedSecretsCell = memo(
  ({ secrets }: { secrets: Array<{ secretId: string }> }) => {
    const secretChips = secrets.map((s) => ({
      id: s.secretId,
      label: s.secretId
    }));

    const renderChip = useCallback(
      (secret: { id: string; label: string }) => (
        <Chip
          key={secret.id}
          size="sm"
          variant="flat"
          classNames={{
            base: 'h-5 bg-default-100 dark:bg-default-200',
            content: 'font-mono text-[10px] text-default-600 px-1.5'
          }}
        >
          {secret.label}
        </Chip>
      ),
      []
    );

    return (
      <ChipList
        items={secretChips}
        maxVisible={4}
        emptyMessage="No secrets linked"
        renderChip={renderChip}
      />
    );
  }
);

LinkedSecretsCell.displayName = 'LinkedSecretsCell';

const EventNameCell = memo(({ groupName }: { groupName: string }) => {
  return <Code color="primary">onepassword_group_{groupName}_updated</Code>;
});

EventNameCell.displayName = 'EventNameCell';

function GroupActionsCell({ group }: { group: GroupWithSecrets }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(`Are you sure you want to delete the group "${group.name}"?`)
    ) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('groupId', group.id);
      await deleteGroup(formData);
    });
  };

  return (
    <ActionButtons>
      <Link href={`/groups?groupId=${group.id}`}>
        <Button isIconOnly size="sm" variant="light" aria-label="Edit group">
          <PencilSimpleIcon size={16} />
        </Button>
      </Link>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        color="danger"
        aria-label="Delete group"
        isLoading={isPending}
        onPress={handleDelete}
      >
        <TrashIcon size={16} />
      </Button>
    </ActionButtons>
  );
}
