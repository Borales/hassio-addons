'use client';

import type { OpItem } from '@/service/1password.service';
import { Listbox, ListboxItem, Pagination } from '@heroui/react';
import { usePathname, useRouter } from 'next/navigation';
import {
  PageNumberCounters,
  PageNumberPagination
} from 'prisma-extension-pagination/dist/types';
import { OpSecretIcon } from './secret-icon';

export const OpSecretList = ({
  items,
  pagination
}: {
  items: OpItem[];
  pagination: PageNumberPagination & PageNumberCounters;
}) => {
  const nav = useRouter();
  const pathname = usePathname();

  const pageUrl = (page: number) => {
    const urlSearchParams = new URLSearchParams();
    if (page > 1) {
      urlSearchParams.set('page', page.toString());
    }
    return `${pathname}?${urlSearchParams}`;
  };

  return (
    <>
      <Listbox
        aria-label="Secrets"
        className="divide-default-300/50 rounded-medium bg-content1 shadow-small dark:divide-default-100/80 gap-0 divide-y overflow-visible p-0"
        itemClasses={{
          base: 'px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80',
          description: 'text-opacity-60'
        }}
      >
        {items.map((item) => (
          <ListboxItem
            key={item.id}
            description={item.additionalInfo}
            startContent={<OpSecretIcon urls={item.urls} alt={item.title} />}
          >
            {item.title}
          </ListboxItem>
        ))}
      </Listbox>
      <Pagination
        classNames={{ wrapper: 'my-4 mx-auto' }}
        showControls
        total={pagination.pageCount}
        page={pagination.currentPage}
        initialPage={1}
        size="lg"
        onChange={(page) => nav.push(pageUrl(page))}
      />
    </>
  );
};
