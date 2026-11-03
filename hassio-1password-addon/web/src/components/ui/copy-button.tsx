'use client';

import { CheckIcon, CopyIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type CopyButtonProps = {
  text: string;
  label: string;
  size?: number;
};

const COPIED_MS = 1200;

/** Icon button with a "Copied" tooltip flash. */
export const CopyButton = ({ text, label, size = 13 }: CopyButtonProps) => {
  const t = useTranslations('toast');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // The clipboard API needs a secure context, which a plain-HTTP Home
      // Assistant doesn't provide. Staying on the copy icon signals the failure.
    }
  };

  return (
    <span
      className={`tooltip ${copied ? 'tooltip-open' : ''}`}
      data-tip={copied ? t('copied') : label}
    >
      <button
        type="button"
        onClick={copy}
        aria-label={`${label}: ${text}`}
        className="btn btn-ghost btn-xs btn-square text-muted hover:text-base-content"
      >
        {copied ? (
          <CheckIcon size={size} className="text-success" />
        ) : (
          <CopyIcon size={size} />
        )}
      </button>
    </span>
  );
};
