'use client';

import { Button } from '@heroui/react';
import { PencilIcon } from '@phosphor-icons/react/dist/ssr';
import { useTranslations } from 'next-intl';
import { Item } from './secret-modal';
import { useSecretModal } from './secret-modal-provider';

type HASecretItemEditProps = {
  secret: Item;
};

export const HASecretItemEdit = ({ secret }: HASecretItemEditProps) => {
  const t = useTranslations('common.actions');
  const { openModal } = useSecretModal();

  return (
    <Button
      isIconOnly
      color="default"
      variant="light"
      onPress={() => openModal(secret)}
      size="sm"
      aria-label={t('edit')}
      title={t('edit')}
    >
      <PencilIcon />
    </Button>
  );
};
