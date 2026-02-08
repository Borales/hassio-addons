'use client';

import { Skeleton } from '@heroui/react';

export default function RateLimitsLoading() {
  return (
    <>
      {/* Page header skeleton */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="mb-2 h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Info banner skeleton */}
      <div className="mb-6">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* Usage cards skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-divider bg-default-50 rounded-lg border p-4"
          >
            <Skeleton className="mb-2 h-6 w-32 rounded-lg" />
            <Skeleton className="mb-4 h-4 w-48 rounded-lg" />
            <Skeleton className="mb-2 h-8 w-full rounded-lg" />
            <Skeleton className="mb-2 h-6 w-full rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Info section skeleton */}
      <div className="mt-6">
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </>
  );
}
