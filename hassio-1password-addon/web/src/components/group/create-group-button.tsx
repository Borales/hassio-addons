'use client';

import { PlusIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useGroupModal } from './group-modal-provider';

export const CreateGroupButton = () => {
  const t = useTranslations('groups.actions');
  const { openCreateModal } = useGroupModal();

  return (
    <button
      type="button"
      className="btn btn-sm btn-primary gap-1.5"
      onClick={openCreateModal}
    >
      <PlusIcon size={14} />
      {t('newGroup')}
    </button>
  );
};
