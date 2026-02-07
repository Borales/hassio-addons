'use client';

import { assignSecret } from '@/actions/assign-secret';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

type HASecretModalSaveProps = {
  activeSecretId: string;
  opSecretId: string | number;
  reference: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export const HASecretModalSave = ({
  activeSecretId,
  opSecretId,
  reference,
  onClose,
  onSuccess
}: HASecretModalSaveProps) => {
  const t = useTranslations('common.actions');
  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await assignSecret(formData);
      if (result.success && onSuccess) {
        onSuccess();
      }
      return result;
    },
    null
  );

  return (
    <>
      {state && !state.success && state.error && (
        <div className="bg-danger-50 text-danger mb-4 rounded-lg p-3 text-sm">
          {state.error}
        </div>
      )}
      <form action={formAction} className="flex w-full justify-end gap-2">
        <input type="hidden" name="haSecretId" value={activeSecretId} />
        <input type="hidden" name="opSecretId" value={opSecretId} />
        <input type="hidden" name="ref" value={reference} />

        <Button
          color="default"
          size="sm"
          variant="light"
          onPress={onClose}
          isDisabled={isPending}
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          color="primary"
          size="sm"
          isLoading={isPending}
          isDisabled={!opSecretId || !reference}
        >
          {t('save')}
        </Button>
      </form>
    </>
  );
};
