'use client';

import { siteConfig } from '@/config/site';
import { ArrowSquareOutIcon, XCircleIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

const code = (chunks: ReactNode) => (
  <code className="font-mono text-[12px]">{chunks}</code>
);

export const ServiceAccountWarning = () => {
  const t = useTranslations('serviceAccountWarning');

  return (
    <div
      role="alert"
      className="alert alert-error alert-soft text-base-content mt-5 items-start"
    >
      <XCircleIcon size={20} className="text-error mt-0.5" />
      <div>
        <h3 className="text-error font-semibold">{t('title')}</h3>
        <div className="mt-0.5 text-[13px] opacity-85">
          {t.rich('description', { code })}
        </div>
      </div>
      <a
        href={siteConfig.serviceAccountDocs}
        target="_blank"
        rel="noreferrer"
        className="btn btn-sm btn-ghost gap-1.5 self-center"
      >
        {t('setup')}
        <ArrowSquareOutIcon size={13} />
      </a>
    </div>
  );
};
