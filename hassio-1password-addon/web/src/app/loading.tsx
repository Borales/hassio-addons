import { PageContainer } from '@/components/ui/page';

export default function Loading() {
  return (
    <PageContainer>
      {/* Page header */}
      <div className="pt-6 pb-5 sm:pt-8">
        <div className="skeleton mb-2 h-7 w-64 rounded-lg" />
        <div className="skeleton h-4 w-full max-w-96 rounded-lg" />
      </div>

      {/* Search and status filter */}
      <div className="mb-4 flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
        <div className="skeleton h-8 w-full rounded-lg md:w-80" />
        <div className="skeleton h-8 w-full rounded-lg md:w-96" />
      </div>

      {/* Table */}
      <div className="rounded-box hairline divide-base-content/10 divide-y overflow-hidden border">
        <div className="surface px-5 py-3">
          <div className="skeleton h-3.5 w-1/3 rounded-lg" />
        </div>
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 px-5 py-3.5"
          >
            <div className="skeleton h-4 w-1/3 rounded-lg" />
            <div className="skeleton hidden h-4 w-1/3 rounded-lg sm:block" />
            <div className="skeleton size-6 rounded-lg" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
