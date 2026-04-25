"use client";

import Link from "next/link";
import { useTranslation } from "@/components/i18n-provider";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-black/[0.06] bg-white/80 backdrop-blur-2xl">
      <div className="page-shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="ImproTrack"
            className="h-6 w-6"
          />
          <span className="text-[13px] font-medium text-ink-700">
            ImproTrack
          </span>
          <span className="text-[12px] text-ink-600">v0.2.0</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-ink-700">
          <Link
            href="/sitemap"
            className="transition-colors hover:text-ink-950"
          >
            {t("footer_sitemap")}
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-ink-950"
          >
            {t("footer_privacy")}
          </Link>
          <Link href="/terms" className="transition-colors hover:text-ink-950">
            {t("footer_terms")}
          </Link>
        </div>
        <p className="text-[12px] text-ink-600 sm:text-right">
          &copy; {new Date().getFullYear()} ImproTrack.
        </p>
      </div>
    </footer>
  );
}
