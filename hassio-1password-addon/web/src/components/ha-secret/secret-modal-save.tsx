'use client';

import { assignSecret } from '@/actions/assign-secret';
import { CheckIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

type HASecretModalSaveProps = {
  activeSecretId: string;
  opSecretId: string;
  reference: string;
  /** "Assign", "Save" or "Re-link", depending on what the dialog is doing. */
  label: string;
  disabled?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (message?: string) => void;
};

export const HASecretModalSave = ({
  activeSecretId,
  opSecretId,
  reference,
  label,
  disabled = false,
  onClose,
  onSuccess,
  onError
}: HASecretModalSaveProps) => {
  const t = useTranslations('common.actions');
  const [, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await assignSecret(formData);
      if (result.success) {
        onSuccess?.();
      } else {
        onError?.(result.error);
      }
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="haSecretId" value={activeSecretId} />
      <input type="hidden" name="opSecretId" value={opSecretId} />
      <input type="hidden" name="ref" value={reference} />

      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={onClose}
        disabled={isPending}
      >
        {t('cancel')}
      </button>
      <button
        type="submit"
        className="btn btn-sm btn-primary gap-1.5"
        disabled={disabled || !opSecretId || !reference || isPending}
      >
        {isPending ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <CheckIcon size={14} />
        )}
        {label}
      </button>
    </form>
  );
};
