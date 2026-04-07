'use client';

import { deleteGroup } from '@/actions/group-delete';
import { GroupWithSecrets } from '@/service/group.service';
import { Button, Chip, Table, Tooltip } from '@heroui/react';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { memo, useCallback, useTransition } from 'react';
import { ActionButtons } from '../ui/action-buttons';
import { ChipList } from '../ui/chip-list';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { useGroupModal } from './group-modal-provider';

type GroupListProps = {
  groups: GroupWithSecrets[];
};

export const GroupList = ({ groups }: GroupListProps) => {
  const t = useTranslations('groups.list.columns');

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Groups">
          <Table.Header>
            <Table.Column isRowHeader>{t('name')}</Table.Column>
            <Table.Column>{t('secrets')}</Table.Column>
            <Table.Column>{t('event')}</Table.Column>
            <Table.Column className="text-end">{t('actions')}</Table.Column>
          </Table.Header>
          <Table.Body items={groups}>
            {(group) => (
              <Table.Row key={group.id}>
                <Table.Cell>
                  <GroupNameCell group={group} />
                </Table.Cell>
                <Table.Cell>
                  <LinkedSecretsCell secrets={group.secrets} />
                </Table.Cell>
                <Table.Cell>
                  <EventNameCell groupName={group.name} />
                </Table.Cell>
                <Table.Cell>
                  <GroupActionsCell group={group} />
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
};

const GroupNameCell = memo(({ group }: { group: GroupWithSecrets }) => {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <Tooltip delay={100}>
          <Tooltip.Trigger>
            <span className="truncate text-sm font-bold">{group.name}</span>
          </Tooltip.Trigger>
          <Tooltip.Content placement="top">{group.description}</Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  );
});

GroupNameCell.displayName = 'GroupNameCell';

const LinkedSecretsCell = memo(
  ({ secrets }: { secrets: Array<{ secretId: string }> }) => {
    const t = useTranslations('groups.list');
    const secretChips = secrets.map((s) => ({
      id: s.secretId,
      label: s.secretId
    }));

    const renderChip = useCallback(
      (secret: { id: string; label: string }) => (
        <Chip key={secret.id} size="sm" className="font-mono">
          {secret.label}
        </Chip>
      ),
      []
    );

    return (
      <ChipList
        items={secretChips}
        maxVisible={4}
        emptyMessage={t('noSecrets')}
        renderChip={renderChip}
      />
    );
  }
);

LinkedSecretsCell.displayName = 'LinkedSecretsCell';

const EventNameCell = memo(({ groupName }: { groupName: string }) => {
  return (
    <Chip variant="soft" color="accent" className="font-mono" size="lg">
      onepassword_group_{groupName}_updated
    </Chip>
  );
});

EventNameCell.displayName = 'EventNameCell';

function GroupActionsCell({ group }: { group: GroupWithSecrets }) {
  const t = useTranslations('groups.actions');
  const tConfirm = useTranslations('groups.list');
  const tCommon = useTranslations('confirmDialog');
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set('groupId', group.id);
      await deleteGroup(formData);
    });
  };

  return (
    <ActionButtons>
      <GroupEditButton group={group} />
      <ConfirmDialog
        message={tConfirm('deleteConfirm')}
        confirmLabel={tCommon('delete')}
        confirmColor="danger"
        onConfirm={handleDelete}
        trigger={(onOpen) => (
          <Button
            isIconOnly
            size="sm"
            variant="danger-soft"
            aria-label={t('deleteGroup')}
            isPending={isPending}
            onPress={onOpen}
          >
            <TrashIcon size={16} />
          </Button>
        )}
      />
    </ActionButtons>
  );
}

function GroupEditButton({ group }: { group: GroupWithSecrets }) {
  const t = useTranslations('groups.actions');
  const { openEditModal } = useGroupModal();

  return (
    <Button
      isIconOnly
      size="sm"
      variant="ghost"
      aria-label={t('editGroup')}
      onPress={() => openEditModal(group)}
    >
      <PencilSimpleIcon size={16} />
    </Button>
  );
}
