import { PageContainer } from '@/components/ui/page';

export default function HelpLoading() {
  return (
    <PageContainer>
      {/* Page header */}
      <div className="pt-6 pb-5 sm:pt-8">
        <div className="skeleton mb-2 h-7 w-64 rounded-lg" />
        <div className="skeleton h-4 w-full max-w-2xl rounded-lg" />
      </div>

      {/* Event list */}
      <div className="space-y-2">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="rounded-box hairline surface flex items-center gap-3 border px-5 py-3.5"
          >
            <div className="skeleton h-4 w-56 rounded-lg" />
            <div className="skeleton hidden h-4 flex-1 rounded-lg sm:block" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
