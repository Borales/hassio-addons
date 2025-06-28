'use client';

import { refreshOpSecret } from '@/actions/refresh-op-secret';
import { Button } from '@heroui/react';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr';
import { useFormStatus } from 'react-dom';

const Submit = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      size="lg"
      isIconOnly
      isLoading={pending}
      color="primary"
      variant="bordered"
      type="submit"
      title="Refetch fields"
    >
      <ArrowClockwiseIcon />
    </Button>
  );
};

type HASecretModalFetchFieldsProps = {
  id: string;
  vaultId: string;
};

export const HASecretModalFetchFields = ({
  id,
  vaultId
}: HASecretModalFetchFieldsProps) => {
  return (
    <form action={refreshOpSecret}>
      <input type="hidden" name="opSecretId" value={id} />
      <input type="hidden" name="opVaultId" value={vaultId} />
      <Submit />
    </form>
  );
};
