export default function DashboardLoading() {
  return (
    <div className="page-shell flex flex-col gap-3.5 py-4 sm:gap-4 sm:py-5">
      <section className="surface-panel animate-pulse rounded-[28px] px-4 py-5 sm:px-6">
        <div className="h-4 w-24 rounded-full bg-black/[0.06]" />
        <div className="mt-4 h-10 max-w-sm rounded-2xl bg-black/[0.08]" />
        <div className="mt-3 h-4 max-w-xl rounded-full bg-black/[0.06]" />
      </section>

      <section className="grid gap-3 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`mobile-loading-${index}`}
            className="surface-panel animate-pulse rounded-[28px] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-black/[0.08]" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded-full bg-black/[0.08]" />
                <div className="mt-2 h-3 w-24 rounded-full bg-black/[0.05]" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }).map((__, cellIndex) => (
                <div
                  key={`mobile-loading-${index}-cell-${cellIndex}`}
                  className="aspect-square rounded-[14px] bg-black/[0.05]"
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="surface-panel hidden animate-pulse rounded-[28px] p-4 md:block sm:p-6">
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={`desktop-loading-${rowIndex}`}
              className="grid grid-cols-[220px_repeat(8,minmax(0,1fr))] gap-2"
            >
              <div className="h-12 rounded-2xl bg-black/[0.07]" />
              {Array.from({ length: 8 }).map((__, cellIndex) => (
                <div
                  key={`desktop-loading-${rowIndex}-cell-${cellIndex}`}
                  className="h-12 rounded-2xl bg-black/[0.05]"
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
