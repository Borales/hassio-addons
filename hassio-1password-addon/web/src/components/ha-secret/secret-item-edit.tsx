'use client';

import { Button } from '@heroui/react';
import { PencilIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type HASecretItemEditProps = {
  secretId: string;
};

export const HASecretItemEdit = ({ secretId }: HASecretItemEditProps) => {
  const pathname = usePathname();

  return (
    <Button
      isIconOnly
      color="default"
      variant="light"
      href={{ pathname, query: { secretId } } as any}
      as={Link}
      prefetch={false}
      scroll={false}
      className="w-8 min-w-8"
    >
      <PencilIcon />
    </Button>
  );
};
