'use client';

import { assignSecret } from '@/actions/assign-secret';
import { unassignSecret } from '@/actions/unassign-secret';
import { LinkBreakIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { mono, useToast } from '../ui/toast-provider';

type HASecretUnassignProps = {
  secretId: string;
  /** Null when the linked 1Password item no longer exists. */
  itemId: string | null;
  reference: string;
};

export const HASecretUnassign = ({
  secretId,
  itemId,
  reference
}: HASecretUnassignProps) => {
  const t = useTranslations('secrets.list.actions');
  const tToast = useTranslations('toast');
  const tErrors = useTranslations('errors.actions');
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const restore = () =>
    startTransition(async () => {
      const formData = new FormData();
      formData.set('haSecretId', secretId);
      formData.set('opSecretId', itemId as string);
      formData.set('ref', reference);

      const result = await assignSecret(formData);
      if (!result.success) {
        toast({ text: result.error ?? tToast('undoFailed'), tone: 'error' });
      }
    });

  const handleClick = () =>
    startTransition(async () => {
      const formData = new FormData();
      formData.set('haSecretId', secretId);

      const result = await unassignSecret(formData);
      if (!result.success) {
        toast({
          text: result.error ?? tErrors('unassignSecretFailed'),
          tone: 'error'
        });
        return;
      }
      toast({
        text: tToast.rich('unassigned', { name: secretId, code: mono }),
        // A link to a deleted item can't be restored
        undo: itemId ? restore : undefined
      });
    });

  return (
    <span className="tooltip" data-tip={t('unassign')}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="btn btn-ghost btn-xs btn-square hover:text-error max-sm:size-11"
        aria-label={t('unassignAria', { name: secretId })}
      >
        <LinkBreakIcon size={14} />
      </button>
    </span>
  );
};
