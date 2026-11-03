import { PageContainer } from '@/components/ui/page';

export default function GroupsLoading() {
  return (
    <PageContainer>
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 pt-6 pb-5 sm:pt-8">
        <div className="min-w-0 flex-1">
          <div className="skeleton mb-2 h-7 w-48 rounded-lg" />
          <div className="skeleton h-4 w-full max-w-96 rounded-lg" />
        </div>
        <div className="skeleton h-8 w-28 rounded-lg" />
      </div>

      {/* Table */}
      <div className="rounded-box hairline divide-base-content/10 divide-y overflow-hidden border">
        <div className="surface px-5 py-3">
          <div className="skeleton h-3.5 w-1/3 rounded-lg" />
        </div>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="skeleton h-4 w-1/4 rounded-lg" />
            <div className="skeleton hidden h-5 w-1/3 rounded-lg sm:block" />
            <div className="skeleton size-6 rounded-lg" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
