'use client';

import { toggleSkipSecret } from '@/actions/toggle-skip-secret';
import { Button } from '@heroui/react';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react/dist/ssr';

type HASecretHideToggleProps = {
  secretId: string;
  isSkipped: boolean | null;
};

export const HASecretHideToggle = ({
  secretId,
  isSkipped
}: HASecretHideToggleProps) => {
  return (
    <form action={toggleSkipSecret}>
      <input type="hidden" name="haSecretId" value={secretId} />
      <Button
        isIconOnly
        color="default"
        variant="light"
        type="submit"
        className="w-8 min-w-8"
        title={isSkipped ? 'Show' : 'Hide'}
      >
        {isSkipped ? <EyeIcon /> : <EyeSlashIcon />}
      </Button>
    </form>
  );
};
