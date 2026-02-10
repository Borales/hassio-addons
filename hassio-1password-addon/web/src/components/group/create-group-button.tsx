'use client';

import { Button } from '@heroui/react';
import { PlusIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useGroupModal } from './group-modal-provider';

export const CreateGroupButton = () => {
  const t = useTranslations('groups.actions');
  const { openCreateModal } = useGroupModal();

  return (
    <Button
      size="sm"
      variant="flat"
      startContent={<PlusIcon weight="bold" size={14} />}
      className="bg-default-100 dark:bg-default-200 text-foreground"
      onPress={openCreateModal}
    >
      {t('newGroup')}
    </Button>
  );
};
