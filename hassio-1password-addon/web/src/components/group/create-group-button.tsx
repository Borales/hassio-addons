'use client';

import { Button } from '@heroui/react';
import { PlusIcon } from '@phosphor-icons/react';
import Link from 'next/link';

export const CreateGroupButton = () => {
  return (
    <Link href="/groups?groupId=new">
      <Button
        size="sm"
        variant="flat"
        startContent={<PlusIcon weight="bold" size={14} />}
        className="bg-default-100 dark:bg-default-200 text-foreground"
      >
        New Group
      </Button>
    </Link>
  );
};
