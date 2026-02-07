'use client';

import { unassignSecret } from '@/actions/unassign-secret';
import { Button } from '@heroui/react';
import { LinkBreakIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

type HASecretUnassignProps = {
  secretId: string;
  isAssigned: boolean;
};

export const HASecretUnassign = ({
  secretId,
  isAssigned
}: HASecretUnassignProps) => {
  const t = useTranslations('common.actions');

  if (!isAssigned) {
    return null;
  }

  return (
    <form action={unassignSecret}>
      <input type="hidden" name="haSecretId" value={secretId} />
      <Button
        isIconOnly
        color="danger"
        variant="light"
        type="submit"
        size="sm"
        aria-label={t('unassign')}
        title={t('unassign')}
      >
        <LinkBreakIcon weight="bold" />
      </Button>
    </form>
  );
};
