'use client';

import { Alert } from '@heroui/react';
import { useTranslations } from 'next-intl';

export const ServiceAccountWarning = () => {
  const t = useTranslations('serviceAccountWarning');

  return (
    <Alert
      color="danger"
      variant="faded"
      className="mb-4"
      title={t('title')}
      description={t('description')}
    />
  );
};
