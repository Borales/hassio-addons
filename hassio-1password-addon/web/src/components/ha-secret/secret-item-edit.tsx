'use client';

import { Button } from '@heroui/react';
import { PencilIcon } from '@phosphor-icons/react/dist/ssr';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type HASecretItemEditProps = {
  secretId: string;
};

export const HASecretItemEdit = ({ secretId }: HASecretItemEditProps) => {
  const pathname = usePathname();
  const t = useTranslations('common.actions');

  return (
    <Button
      isIconOnly
      color="default"
      variant="light"
      href={{ pathname, query: { secretId } } as any}
      as={Link}
      prefetch={false}
      scroll={false}
      size="sm"
      aria-label={t('edit')}
      title={t('edit')}
    >
      <PencilIcon />
    </Button>
  );
};
