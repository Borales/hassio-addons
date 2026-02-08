'use client';

import { refreshRateLimits } from '@/actions/refresh-ratelimits';
import { Button } from '@heroui/react';
import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

const Submit = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('rateLimits');

  return (
    <Button
      isLoading={pending}
      size="sm"
      variant="flat"
      type="submit"
      startContent={!pending && <ArrowsClockwiseIcon size={14} />}
      className="bg-default-100 dark:bg-default-200 text-foreground"
    >
      {t('refreshButton')}
    </Button>
  );
};

export const RefreshButton = () => {
  const handleAction = async () => {
    await refreshRateLimits();
  };

  return (
    <form action={handleAction}>
      <Submit />
    </form>
  );
};
