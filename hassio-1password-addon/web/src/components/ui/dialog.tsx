'use client';

import { XIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect, useRef } from 'react';

type DialogProps = {
  onClose: () => void;
  labelledBy: string;
  /** Tailwind max-width applied from the `sm` breakpoint up. */
  width?: string;
  children: ReactNode;
};

/**
 * daisyUI modal on a native <dialog>: focus trap, Esc to close, backdrop click.
 * A bottom sheet on phones, centered from `sm`. Mount it to open it.
 */
export const Dialog = ({
  onClose,
  labelledBy,
  width = 'sm:max-w-[540px]',
  children
}: DialogProps) => {
  const t = useTranslations('common.actions');
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
    // showModal() focuses the first button (Close); prefer the primary field.
    ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal modal-bottom sm:modal-middle"
      onClose={onClose}
      aria-labelledby={labelledBy}
    >
      <div
        className={`modal-box flex max-h-[88vh] w-full flex-col overflow-hidden ${width}`}
      >
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label={t('close')}>{t('close')}</button>
      </form>
    </dialog>
  );
};

type DialogHeaderProps = {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
};

export const DialogHeader = ({
  id,
  title,
  subtitle,
  onClose
}: DialogHeaderProps) => {
  const t = useTranslations('common.actions');

  return (
    <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 pb-4 sm:px-6">
      <div className="min-w-0">
        <h2 id={id} className="text-[16px] font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <div className="text-muted mt-0.5 truncate font-mono text-[13px]">
            {subtitle}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="btn btn-ghost btn-sm btn-square -mt-1 -mr-1"
        aria-label={t('close')}
      >
        <XIcon size={16} />
      </button>
    </div>
  );
};

type DialogFooterProps = {
  left?: ReactNode;
  children: ReactNode;
};

export const DialogFooter = ({ left, children }: DialogFooterProps) => (
  <div className="hairline bg-base-200/50 flex shrink-0 items-center justify-between gap-3 border-t px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6">
    <div className="min-w-0 flex-1">{left}</div>
    <div className="flex shrink-0 items-center gap-2">{children}</div>
  </div>
);
