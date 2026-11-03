'use client';

import { createGroup } from '@/actions/group-create';
import { deleteGroup } from '@/actions/group-delete';
import { eventForGroup, SecretRow } from '@/lib/secret-status';
import { GroupWithSecrets } from '@/service/group.service';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { ChipList } from '../ui/chip-list';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { CopyButton } from '../ui/copy-button';
import { EventName } from '../ui/event-name';
import { StatusDot } from '../ui/status-dot';
import { mono, useToast } from '../ui/toast-provider';
import { useGroupModal } from './group-modal-provider';

type GroupListProps = {
  groups: GroupWithSecrets[];
  secrets: SecretRow[];
};

export const GroupList = ({ groups, secrets }: GroupListProps) => {
  const t = useTranslations('groups');

  return (
    <>
      <div className="rounded-box hairline hidden overflow-hidden border md:block">
        <table className="tbl table" aria-label={t('title')}>
          <thead>
            <tr>
              <th className="w-[28%] !pl-5">{t('list.columns.name')}</th>
              <th>{t('list.columns.secrets')}</th>
              <th>{t('list.columns.event')}</th>
              <th className="w-[90px] !pr-4">
                <span className="sr-only">{t('list.columns.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td className="!pl-5">
                  <GroupName group={group} />
                </td>
                <td>
                  <LinkedSecrets group={group} secrets={secrets} />
                </td>
                <td>
                  <EventNameCell name={group.name} />
                </td>
                <td className="!pr-4">
                  <div className="row-actions flex items-center justify-end gap-0.5">
                    <GroupActions group={group} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones */}
      <ul className="space-y-2.5 md:hidden" aria-label={t('title')}>
        {groups.map((group) => (
          <li
            key={group.id}
            className="rounded-box hairline surface border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-[14px] font-medium">
                  {group.name}
                </div>
                {group.description && (
                  <div className="text-muted mt-0.5 text-[12.5px]">
                    {group.description}
                  </div>
                )}
              </div>
              <div className="-mt-1 -mr-1.5 flex">
                <GroupActions group={group} size="sm" />
              </div>
            </div>
            <div className="mt-3">
              <LinkedSecrets group={group} secrets={secrets} />
            </div>
            <div className="mt-3 flex min-w-0 items-center gap-0.5">
              <EventNameCell name={group.name} />
            </div>
          </li>
        ))}
      </ul>

      <p className="text-muted mt-3 text-[12.5px]">
        {groups.length} {t('groupCount', { count: groups.length })}
      </p>
    </>
  );
};

const GroupName = ({ group }: { group: GroupWithSecrets }) => {
  const { openEditModal } = useGroupModal();

  return (
    <>
      <button
        type="button"
        onClick={() => openEditModal(group)}
        className="hover:text-primary decoration-primary/40 text-left font-mono text-[13.5px] font-medium underline-offset-4 hover:underline"
      >
        {group.name}
      </button>
      {group.description && (
        <div className="text-muted mt-0.5 line-clamp-1 text-[12.5px]">
          {group.description}
        </div>
      )}
    </>
  );
};

const LinkedSecrets = ({
  group,
  secrets
}: {
  group: GroupWithSecrets;
  secrets: SecretRow[];
}) => {
  const t = useTranslations('groups.list');

  if (group.secrets.length === 0) {
    return (
      <span className="text-muted text-[12.5px] italic">{t('noSecrets')}</span>
    );
  }

  return (
    <ChipList
      wrap
      maxVisible={3}
      overflowLabel={(count) => t('moreSecrets', { count })}
      items={group.secrets.map(({ secretId }) => ({
        id: secretId,
        label: secretId,
        prefix: (
          <StatusDot
            status={
              secrets.find(({ id }) => id === secretId)?.status ?? 'hidden'
            }
          />
        )
      }))}
    />
  );
};

const EventNameCell = ({ name }: { name: string }) => {
  const t = useTranslations('groups.list');
  const event = eventForGroup(name);

  return (
    <span className="inline-flex max-w-full items-center gap-1">
      <EventName name={event} className="min-w-0" />
      <CopyButton text={event} label={t('copyEvent')} />
    </span>
  );
};

type GroupActionsProps = {
  group: GroupWithSecrets;
  size?: 'xs' | 'sm';
};

const GroupActions = ({ group, size = 'xs' }: GroupActionsProps) => {
  const t = useTranslations('groups');
  const tConfirm = useTranslations('confirmDialog');
  const tToast = useTranslations('toast');
  const tErrors = useTranslations('errors.actions');
  const toast = useToast();
  const { openEditModal } = useGroupModal();
  const buttonClass = `btn btn-ghost btn-square ${size === 'sm' ? 'btn-sm' : 'btn-xs'}`;
  const iconSize = size === 'sm' ? 15 : 14;

  const restore = async () => {
    const formData = new FormData();
    formData.set('name', group.name);
    formData.set('description', group.description ?? '');
    group.secrets.forEach(({ secretId }) =>
      formData.append('secretIds', secretId)
    );

    const result = await createGroup(formData);
    if (!result.success) {
      toast({ text: result.error ?? tToast('undoFailed'), tone: 'error' });
    }
  };

  const handleDelete = async () => {
    const formData = new FormData();
    formData.set('groupId', group.id);

    const result = await deleteGroup(formData);
    if (!result.success) {
      toast({
        text: result.error ?? tErrors('deleteGroupFailed'),
        tone: 'error'
      });
      return;
    }
    toast({
      text: tToast.rich('groupDeleted', { name: group.name, code: mono }),
      undo: restore
    });
  };

  return (
    <>
      <span className="tooltip" data-tip={t('actions.editGroup')}>
        <button
          type="button"
          onClick={() => openEditModal(group)}
          className={buttonClass}
          aria-label={t('actions.editAria', { name: group.name })}
        >
          <PencilSimpleIcon size={iconSize} />
        </button>
      </span>
      <ConfirmDialog
        title={t('delete.title', { name: group.name })}
        message={t.rich('delete.body', {
          count: group.secrets.length,
          event: () => <EventName name={eventForGroup(group.name)} />
        })}
        confirmLabel={tConfirm('delete')}
        confirmColor="danger"
        onConfirm={handleDelete}
        trigger={(onOpen) => (
          <span className="tooltip tooltip-left" data-tip={tConfirm('delete')}>
            <button
              type="button"
              onClick={onOpen}
              className={`${buttonClass} hover:text-error`}
              aria-label={t('actions.deleteAria', { name: group.name })}
            >
              <TrashIcon size={iconSize} />
            </button>
          </span>
        )}
      />
    </>
  );
};
