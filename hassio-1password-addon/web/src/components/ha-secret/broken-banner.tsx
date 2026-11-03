'use client';

import { WarningIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

type BrokenBannerProps = {
  count: number;
  /** Applies the Broken filter; omitted while that filter is already active. */
  onShow?: () => void;
};

export const BrokenBanner = ({ count, onShow }: BrokenBannerProps) => {
  const t = useTranslations('secrets.broken');

  return (
    <div
      role="alert"
      className="alert alert-error alert-soft text-base-content mt-5"
    >
      <WarningIcon size={20} className="text-error" />
      <div>
        <h3 className="text-error font-semibold">{t('banner', { count })}</h3>
        <div className="mt-0.5 text-[13px] opacity-85">
          {t.rich('bannerBody', {
            wide: (chunks) => (
              <span className="hidden sm:inline">{chunks}</span>
            ),
            code: (chunks) => (
              <span className="font-mono text-[12px]">{chunks}</span>
            )
          })}
        </div>
      </div>
      {onShow && (
        <button type="button" onClick={onShow} className="btn btn-sm btn-ghost">
          {t('show', { count })}
        </button>
      )}
    </div>
  );
};
