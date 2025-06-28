'use client';

import { forceUpdateNow } from '@/actions/force-update';
import { Button } from '@heroui/react';
import { useFormStatus } from 'react-dom';

const Submit = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      isLoading={pending}
      size="sm"
      color="primary"
      variant="light"
      type="submit"
    >
      Force-update now
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
