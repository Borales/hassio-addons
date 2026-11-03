'use client';

import { refreshRateLimits } from '@/actions/refresh-ratelimits';
import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

const Submit = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('rateLimits');

  return (
    <button
      type="submit"
      className="btn btn-sm btn-ghost hairline gap-1.5 border"
      disabled={pending}
    >
      <ArrowsClockwiseIcon
        size={14}
        className={pending ? 'animate-spin' : ''}
      />
      {t('refreshButton')}
    </button>
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
