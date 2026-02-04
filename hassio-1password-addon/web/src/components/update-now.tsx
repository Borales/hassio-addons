'use client';

import { forceUpdateNow } from '@/actions/force-update';
import { Button } from '@heroui/react';
import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useFormStatus } from 'react-dom';

const Submit = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      isLoading={pending}
      size="sm"
      variant="flat"
      type="submit"
      startContent={!pending && <ArrowsClockwiseIcon size={14} />}
      className="bg-default-100 dark:bg-default-200 text-foreground"
    >
      Sync Now
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
