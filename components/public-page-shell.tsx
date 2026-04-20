"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { AuthControls } from "@/components/auth-controls";
import { Footer } from "@/components/footer";

type PublicPageNavLink = {
  href: string;
  label: string;
};

type PublicPageShellProps = {
  children: React.ReactNode;
  navLinks?: PublicPageNavLink[];
  width?: "standard" | "wide";
};

function PublicNavLink({
  href,
  label,
  onNavigate,
}: PublicPageNavLink & { onNavigate?: () => void }) {
  const classes =
    "rounded-lg px-1 py-1 transition-colors hover:text-ink-950 focus-visible:text-ink-950";

  if (href.startsWith("#")) {
    return (
      <a href={href} className={classes} onClick={onNavigate}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onNavigate}>
      {label}
    </Link>
  );
}

export function PublicPageShell({
  children,
  navLinks = [],
  width = "wide",
}: PublicPageShellProps) {
  const widthClass = width === "standard" ? "max-w-5xl" : "max-w-6xl";
  const pathname = usePathname();
  const mobileMenuId = useId();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="public-backdrop relative min-h-screen overflow-hidden text-ink-950">
      <a
        href="#main-content"
        className="sr-only z-[120] rounded-xl bg-ink-950 px-4 py-2 text-[14px] font-semibold text-white shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header className="header-bar sticky top-0 z-40">
        <div
          className={`page-shell mx-auto flex ${widthClass} items-center justify-between gap-4 py-3 sm:gap-6 sm:py-3.5`}
        >
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
            <img src="/logo.svg" alt="ImproTrack" className="h-8 w-8 sm:h-9 sm:w-9" />
            <span className="font-display text-[17px] font-semibold text-ink-950 sm:text-[18px]">
              ImproTrack
            </span>
          </Link>

          {navLinks.length > 0 ? (
            <nav
              aria-label="Primary public navigation"
              className="hidden items-center gap-5 text-[14px] font-medium text-ink-700 md:flex"
            >
              {navLinks.map((link) => (
                <PublicNavLink key={`${link.href}-${link.label}`} {...link} />
              ))}
            </nav>
          ) : null}

          <div className="hidden md:block">
            <AuthControls variant="landing" />
          </div>

          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuId}
            aria-label={mobileMenuOpen ? "Close site menu" : "Open site menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="tap-target inline-flex items-center justify-center rounded-xl border border-black/[0.06] bg-white/80 text-ink-950 shadow-[var(--shadow-card)] md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" strokeWidth={1.8} />
            ) : (
              <Menu className="h-4 w-4" strokeWidth={1.8} />
            )}
          </button>
        </div>

        <div
          id={mobileMenuId}
          className={`${mobileMenuOpen ? "block" : "hidden"} border-t border-black/[0.06] md:hidden`}
        >
          <div className={`page-shell mx-auto ${widthClass} py-3`}>
            <div className="surface-panel rounded-[24px] p-3.5">
              {navLinks.length > 0 ? (
                <nav
                  aria-label="Mobile public navigation"
                  className="flex flex-col gap-1 text-[14px] font-medium text-ink-700"
                >
                  {navLinks.map((link) => (
                    <PublicNavLink
                      key={`${link.href}-${link.label}-mobile`}
                      {...link}
                      onNavigate={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </nav>
              ) : null}

              <div className={`${navLinks.length > 0 ? "mt-3 border-t border-black/[0.06] pt-3" : ""}`}>
                <AuthControls variant="landing" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  );
}
