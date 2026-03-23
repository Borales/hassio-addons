'use client';

import { forceUpdateNow } from '@/actions/force-update';
import { Button, Spinner } from '@heroui/react';
import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

const Submit = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('home');

  return (
    <Button
      isPending={pending}
      size="sm"
      variant="tertiary"
      type="submit"
      className="bg-default-100 dark:bg-default-200 text-foreground"
    >
      {pending && <Spinner color="current" size="sm" />}
      {!pending && <ArrowsClockwiseIcon size={14} />}
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
