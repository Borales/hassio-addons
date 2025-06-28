'use client';

import { assignSecret } from '@/actions/assign-secret';
import { Button } from '@heroui/react';
import { useFormStatus } from 'react-dom';

type HASecretModalSaveProps = {
  activeSecretId: string;
  opSecretId: string | number;
  reference: string;
  onClose: () => void;
};

const Submit = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      isLoading={pending}
      type="submit"
      color="primary"
      size="sm"
      variant="shadow"
    >
      Save
    </Button>
  );
};

export const HASecretModalSave = ({
  activeSecretId,
  opSecretId,
  reference,
  onClose
}: HASecretModalSaveProps) => {
  return (
    <form action={assignSecret}>
      <input type="hidden" name="haSecretId" value={activeSecretId} />
      <input type="hidden" name="opSecretId" value={opSecretId} />
      <input type="hidden" name="ref" value={reference} />

      <Button
        color="default"
        size="sm"
        className="mr-4"
        variant="shadow"
        onClick={onClose}
      >
        Cancel
      </Button>
      <Submit />
    </form>
  );
};
