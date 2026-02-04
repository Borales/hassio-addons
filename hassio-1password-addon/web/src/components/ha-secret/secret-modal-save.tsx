'use client';

import { assignSecret } from '@/actions/assign-secret';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

type HASecretModalSaveProps = {
  activeSecretId: string;
  opSecretId: string | number;
  reference: string;
  onClose: () => void;
};

const Submit = () => {
  const t = useTranslations('common.actions');
  const { pending } = useFormStatus();

  return (
    <Button
      isLoading={pending}
      type="submit"
      color="primary"
      size="sm"
      variant="shadow"
    >
      {t('save')}
    </Button>
  );
};

export const HASecretModalSave = ({
  activeSecretId,
  opSecretId,
  reference,
  onClose
}: HASecretModalSaveProps) => {
  const t = useTranslations('common.actions');
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
        {t('cancel')}
      </Button>
      <Submit />
    </form>
  );
};
