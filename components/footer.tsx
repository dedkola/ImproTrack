export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-white/80 backdrop-blur-2xl">
      <div className="page-shell flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="ImproTrack"
            className="h-6 w-6 drop-shadow-[0_1px_4px_rgba(109,40,217,0.4)]"
          />
          <span className="text-[13px] font-medium text-ink-700">
            ImproTrack
          </span>
          <span className="text-[12px] text-ink-600">v0.2.0</span>
        </div>
        <p className="text-[12px] text-ink-600">
          &copy; {new Date().getFullYear()} ImproTrack. Built with Next.js
        </p>
      </div>
    </footer>
  );
}
