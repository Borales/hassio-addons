'use client';

import { Alert } from '@heroui/react';
import { useTranslations } from 'next-intl';

export const ServiceAccountWarning = () => {
  const t = useTranslations('serviceAccountWarning');

  return (
    <Alert status="danger" className="mb-4">
      <Alert.Content>
        <Alert.Title>{t('title')}</Alert.Title>
        <Alert.Description>{t('description')}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
};
