export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-white/80 backdrop-blur-2xl">
      <div className="page-shell flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#3274C7] text-[11px] font-bold text-white">
            M
          </span>
          <span className="text-[13px] font-medium text-ink-700">Momentum</span>
          <span className="text-[12px] text-ink-600">v0.2.0</span>
        </div>
        <p className="text-[12px] text-ink-600">
          &copy; {new Date().getFullYear()} Momentum. Built with Next.js
        </p>
      </div>
    </footer>
  );
}
