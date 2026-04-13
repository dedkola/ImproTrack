import Link from "next/link";
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

function PublicNavLink({ href, label }: PublicPageNavLink) {
  const classes = "transition-colors hover:text-ink-950";

  if (href.startsWith("#")) {
    return (
      <a href={href} className={classes}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
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

  return (
    <div className="public-backdrop relative min-h-screen overflow-hidden text-ink-950">
      <header className="header-bar sticky top-0 z-40">
        <div
          className={`page-shell mx-auto flex ${widthClass} items-center justify-between gap-4 py-3 sm:gap-6 sm:py-3.5`}
        >
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
            <img
              src="/logo.svg"
              alt="ImproTrack"
              className="h-8 w-8 sm:h-9 sm:w-9"
            />
            <span className="font-display text-[17px] font-semibold text-ink-950 sm:text-[18px]">
              ImproTrack
            </span>
          </Link>

          {navLinks.length > 0 ? (
            <nav className="hidden items-center gap-5 text-[14px] font-medium text-ink-700 md:flex">
              {navLinks.map((link) => (
                <PublicNavLink key={`${link.href}-${link.label}`} {...link} />
              ))}
            </nav>
          ) : null}

          <AuthControls variant="landing" />
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <Footer />
    </div>
  );
}
