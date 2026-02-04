export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="bg-default-200 mb-2 h-7 w-48 rounded"></div>
          <div className="bg-default-200 h-4 w-96 rounded"></div>
        </div>
        <div className="bg-default-200 h-10 w-40 rounded"></div>
      </div>

      {/* Info banner */}
      <div className="border-divider bg-default-50 dark:bg-default-100/20 mb-6 rounded-lg border px-4 py-3">
        <div className="bg-default-200 h-5 w-full max-w-2xl rounded"></div>
      </div>

      {/* Table header */}
      <div className="border-divider bg-default-50 dark:bg-default-100/30 rounded-t-lg border-b">
        <div className="grid grid-cols-[1fr_2fr_180px_100px] gap-4 px-4 py-3">
          <div className="bg-default-300 h-4 w-24 rounded"></div>
          <div className="bg-default-300 h-4 w-28 rounded"></div>
          <div className="bg-default-300 h-4 w-24 rounded"></div>
          <div className="bg-default-300 ml-auto h-4 w-16 rounded"></div>
        </div>
      </div>

      {/* Table body - Loading rows */}
      <div className="border-divider divide-divider divide-y overflow-hidden rounded-b-lg border border-t-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-background grid grid-cols-[1fr_2fr_180px_100px] gap-4 px-4 py-4"
          >
            <div className="bg-default-200 h-5 w-3/4 rounded"></div>
            <div className="flex flex-wrap gap-2">
              <div className="bg-default-200 h-6 w-24 rounded-full"></div>
              <div className="bg-default-200 h-6 w-28 rounded-full"></div>
              <div className="bg-default-200 h-6 w-20 rounded-full"></div>
            </div>
            <div className="bg-default-200 h-5 w-full rounded"></div>
            <div className="flex justify-end gap-2">
              <div className="bg-default-200 h-8 w-8 rounded"></div>
              <div className="bg-default-200 h-8 w-8 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
