'use client';

import { Skeleton } from '@heroui/react';

export default function Loading() {
  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <Skeleton className="mb-2 h-7 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>

      {/* Summary stats */}
      <div className="mb-4 flex items-center gap-4">
        <Skeleton className="h-5 w-20 rounded-lg" />
        <Skeleton className="h-5 w-1 rounded-lg" />
        <Skeleton className="h-5 w-24 rounded-lg" />
        <Skeleton className="h-5 w-1 rounded-lg" />
        <Skeleton className="h-5 w-28 rounded-lg" />
      </div>

      {/* Table header */}
      <div className="border-divider bg-default-50 dark:bg-default-100/30 rounded-t-lg border-b">
        <div className="grid grid-cols-[1fr_200px_180px_100px] gap-4 px-4 py-3">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="ml-auto h-4 w-16 rounded-lg" />
        </div>
      </div>

      {/* Table body - Loading rows */}
      <div className="border-divider divide-divider mb-6 divide-y overflow-hidden rounded-b-lg border border-t-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-background grid grid-cols-[1fr_200px_180px_100px] gap-4 px-4 py-4"
          >
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-5 w-full rounded-lg" />
            <Skeleton className="h-5 w-32 rounded-lg" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer status bar */}
      <div className="border-divider bg-default-50 dark:bg-default-100/20 flex items-center justify-between rounded-lg border px-4 py-3">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </>
  );
}
