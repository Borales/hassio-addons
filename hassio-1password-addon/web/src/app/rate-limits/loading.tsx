import { PageContainer } from '@/components/ui/page';

export default function RateLimitsLoading() {
  return (
    <PageContainer>
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 pt-6 pb-5 sm:pt-8">
        <div className="min-w-0 flex-1">
          <div className="skeleton mb-2 h-7 w-64 rounded-lg" />
          <div className="skeleton h-4 w-full max-w-96 rounded-lg" />
        </div>
        <div className="skeleton h-8 w-24 rounded-lg" />
      </div>

      <div className="space-y-4">
        {/* Usage cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2].map((key) => (
            <div key={key} className="rounded-box hairline surface border p-5">
              <div className="skeleton mb-2 h-5 w-32 rounded-lg" />
              <div className="skeleton mb-5 h-4 w-full max-w-64 rounded-lg" />
              <div className="skeleton mb-2 h-2 w-full rounded-lg" />
              <div className="skeleton h-3 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* About rate limits */}
        <div className="skeleton rounded-box h-32 w-full" />
      </div>
    </PageContainer>
  );
}
