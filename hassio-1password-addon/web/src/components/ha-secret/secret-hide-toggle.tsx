'use client';

import { toggleSkipSecret } from '@/actions/toggle-skip-secret';
import { Button } from '@nextui-org/react';
import { Eye, EyeSlash } from '@phosphor-icons/react/dist/ssr';

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
        {isSkipped ? <Eye /> : <EyeSlash />}
      </Button>
    </form>
  );
};
