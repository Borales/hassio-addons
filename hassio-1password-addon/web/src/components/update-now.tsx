'use client';

import { forceUpdateNow } from '@/actions/force-update';
import { Button } from '@heroui/react';
import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

const Submit = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('home');

  return (
    <Button
      isLoading={pending}
      size="sm"
      variant="flat"
      type="submit"
      startContent={!pending && <ArrowsClockwiseIcon size={14} />}
      className="bg-default-100 dark:bg-default-200 text-foreground"
    >
      {t('updateNow')}
    </Button>
  );
};

export const UpdateNowBtn = () => {
  return (
    <form action={forceUpdateNow}>
      <Submit />
    </form>
  );
};
