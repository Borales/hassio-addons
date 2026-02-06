'use client';

import { toggleSkipSecret } from '@/actions/toggle-skip-secret';
import { Button } from '@heroui/react';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react/dist/ssr';
import { useTranslations } from 'next-intl';

type HASecretHideToggleProps = {
  secretId: string;
  isSkipped: boolean | null;
};

export const HASecretHideToggle = ({
  secretId,
  isSkipped
}: HASecretHideToggleProps) => {
  const t = useTranslations('common.actions');

  return (
    <form action={toggleSkipSecret}>
      <input type="hidden" name="haSecretId" value={secretId} />
      <Button
        isIconOnly
        color="default"
        variant="light"
        type="submit"
        size="sm"
        title={isSkipped ? t('show') : t('hide')}
      >
        {isSkipped ? <EyeIcon /> : <EyeSlashIcon />}
      </Button>
    </form>
  );
};
