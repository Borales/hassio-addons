'use client';

import { Skeleton } from '@heroui/react';

export default function GroupsLoading() {
  return (
    <>
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="mb-2 h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Info banner */}
      <div className="mb-6">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* Table header */}
      <div className="border-divider bg-default-50 dark:bg-default-100/30 rounded-t-lg border-b">
        <div className="grid grid-cols-[1fr_2fr_180px_100px] gap-4 px-4 py-3">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="ml-auto h-4 w-16 rounded-lg" />
        </div>
      </div>

      {/* Table body - Loading rows */}
      <div className="border-divider divide-divider divide-y overflow-hidden rounded-b-lg border border-t-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-background grid grid-cols-[1fr_2fr_180px_100px] gap-4 px-4 py-4"
          >
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-full rounded-lg" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
