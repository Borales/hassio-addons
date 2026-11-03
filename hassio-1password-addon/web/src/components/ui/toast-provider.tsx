'use client';

import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  XCircleIcon
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

type Toast = {
  text: ReactNode;
  tone?: 'success' | 'error';
  /** Reversible actions offer Undo instead of asking for confirmation first. */
  undo?: () => void;
};

const ToastContext = createContext<((toast: Toast) => void) | undefined>(
  undefined
);

const TOAST_MS = 2500;
const TOAST_WITH_UNDO_MS = 5000;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const t = useTranslations('toast');
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(
      () => setToast(null),
      toast.undo ? TOAST_WITH_UNDO_MS : TOAST_MS
    );
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((next: Toast) => setToast(next), []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          className="toast toast-top toast-end z-[70] pt-16 md:pt-4"
          role="status"
          aria-live="polite"
        >
          <div className="alert hairline bg-base-200 text-base-content fade-in gap-3 border px-3.5 py-2.5 shadow-xl">
            {toast.tone === 'error' ? (
              <XCircleIcon size={16} className="text-error" />
            ) : (
              <CheckIcon size={16} className="text-success" />
            )}
            <span className="text-[13px]">{toast.text}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  setToast(null);
                }}
                className="btn btn-xs btn-ghost text-primary gap-1"
              >
                <ArrowCounterClockwiseIcon size={12} />
                {t('undo')}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/** Identifiers inside toast messages: t.rich('assigned', { name, code: mono }) */
export const mono = (chunks: ReactNode) => (
  <span className="font-mono">{chunks}</span>
);
