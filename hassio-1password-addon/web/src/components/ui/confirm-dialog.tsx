'use client';

import { TrashIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { ReactElement, ReactNode, useId, useState } from 'react';
import { Dialog, DialogFooter } from './dialog';

type ConfirmDialogProps = {
  title?: ReactNode;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'danger' | 'warning';
  onConfirm: () => void | Promise<void>;
  trigger: (onOpen: () => void) => ReactElement;
};

const confirmColorMap = {
  primary: 'btn-primary',
  danger: 'btn-error',
  warning: 'btn-warning'
} as const;

export const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmColor = 'primary',
  onConfirm,
  trigger
}: ConfirmDialogProps) => {
  const t = useTranslations('confirmDialog');
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => setIsOpen(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      handleClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {trigger(() => setIsOpen(true))}
      {isOpen && (
        <Dialog
          onClose={handleClose}
          labelledBy={titleId}
          width="sm:max-w-[420px]"
        >
          <div className="flex gap-4 px-6 pt-6 pb-5">
            {confirmColor === 'danger' && (
              <div className="bg-error/15 text-error flex size-10 shrink-0 items-center justify-center rounded-full">
                <TrashIcon size={18} />
              </div>
            )}
            <div className="min-w-0">
              <h2 id={titleId} className="text-[15px] font-semibold">
                {title || t('title')}
              </h2>
              <div className="text-base-content/70 mt-1.5 text-[13.5px] leading-relaxed">
                {message}
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={handleClose}
              disabled={isProcessing}
            >
              {cancelLabel || t('cancel')}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${confirmColorMap[confirmColor]}`}
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing && (
                <span className="loading loading-spinner loading-xs" />
              )}
              {confirmLabel || t('confirm')}
            </button>
          </DialogFooter>
        </Dialog>
      )}
    </>
  );
};
