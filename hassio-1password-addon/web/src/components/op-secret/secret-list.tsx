'use client';

import type { OpItem } from '@/service/1password.service';
import { Listbox, ListboxItem, Pagination } from '@nextui-org/react';
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
        className="gap-0 divide-y divide-default-300/50 overflow-visible rounded-medium bg-content1 p-0 shadow-small dark:divide-default-100/80"
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
