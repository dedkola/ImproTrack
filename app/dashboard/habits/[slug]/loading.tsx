export default function HabitDetailLoading() {
  return (
    <div className="page-shell flex flex-col gap-3.5 py-4 sm:gap-4 sm:py-5">
      <section className="surface-panel animate-pulse rounded-[28px] px-4 py-5 sm:px-6">
        <div className="h-10 w-32 rounded-xl bg-black/[0.06]" />
        <div className="mt-5 flex items-start gap-3">
          <div className="h-12 w-12 rounded-[20px] bg-black/[0.08]" />
          <div className="min-w-0 flex-1">
            <div className="h-8 max-w-sm rounded-2xl bg-black/[0.08]" />
            <div className="mt-3 h-4 max-w-xl rounded-full bg-black/[0.06]" />
            <div className="mt-2 h-4 max-w-lg rounded-full bg-black/[0.05]" />
          </div>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <section className="surface-panel animate-pulse rounded-[28px] p-4 sm:p-6">
          <div className="h-5 w-32 rounded-full bg-black/[0.08]" />
          <div className="mt-5 grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={`habit-loading-cell-${index}`} className="aspect-square rounded-xl bg-black/[0.05]" />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`habit-loading-stat-${index}`}
              className="surface-panel animate-pulse rounded-[24px] p-4"
            >
              <div className="h-3 w-20 rounded-full bg-black/[0.05]" />
              <div className="mt-3 h-8 w-16 rounded-2xl bg-black/[0.08]" />
              <div className="mt-2 h-3 w-24 rounded-full bg-black/[0.05]" />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
