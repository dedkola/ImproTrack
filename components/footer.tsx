import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-white/80 backdrop-blur-2xl">
      <div className="page-shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-ink-700">
          <Link
            href="/privacy"
            className="transition-colors hover:text-ink-950"
          >
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-ink-950">
            Terms of Service
          </Link>
        </div>
        <p className="text-[12px] text-ink-600 sm:text-right">
          &copy; {new Date().getFullYear()} ImproTrack. Built with Next.js
        </p>
      </div>
    </footer>
  );
}
