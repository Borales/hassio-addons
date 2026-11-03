'use client';

import { toggleSkipSecret } from '@/actions/toggle-skip-secret';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { mono, useToast } from '../ui/toast-provider';

type HASecretHideToggleProps = {
  secretId: string;
  isSkipped: boolean | null;
};

export const HASecretHideToggle = ({
  secretId,
  isSkipped
}: HASecretHideToggleProps) => {
  const t = useTranslations('secrets.list.actions');
  const tToast = useTranslations('toast');
  const tErrors = useTranslations('errors.actions');
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const toggle = async () => {
    const formData = new FormData();
    formData.set('haSecretId', secretId);
    return toggleSkipSecret(formData);
  };

  const handleClick = () =>
    startTransition(async () => {
      const result = await toggle();
      if (!result.success) {
        toast({
          text: result.error ?? tErrors('toggleSkipFailed'),
          tone: 'error'
        });
        return;
      }
      toast({
        text: tToast.rich(isSkipped ? 'shown' : 'hidden', {
          name: secretId,
          code: mono
        }),
        undo: () =>
          startTransition(async () => {
            const undone = await toggle();
            if (!undone.success) {
              toast({
                text: undone.error ?? tToast('undoFailed'),
                tone: 'error'
              });
            }
          })
      });
    });

  // The icon and label say what the button will do, not the current state.
  return (
    <span
      className="tooltip tooltip-left"
      data-tip={isSkipped ? t('show') : t('hide')}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="btn btn-ghost btn-xs btn-square max-sm:size-11"
        aria-label={t(isSkipped ? 'showAria' : 'hideAria', { name: secretId })}
      >
        {isSkipped ? <EyeIcon size={14} /> : <EyeSlashIcon size={14} />}
      </button>
    </span>
  );
};
