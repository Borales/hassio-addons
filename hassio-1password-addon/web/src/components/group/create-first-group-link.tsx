'use client';

import { useTranslations } from 'next-intl';
import { useGroupModal } from './group-modal-provider';

export const CreateFirstGroupLink = () => {
  const t = useTranslations('groups');
  const { openCreateModal } = useGroupModal();

  return (
    <button
      onClick={openCreateModal}
      className="text-primary text-sm hover:underline"
    >
      {t('createFirstGroup')}
    </button>
  );
};
