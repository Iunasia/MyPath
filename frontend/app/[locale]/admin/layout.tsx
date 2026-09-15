"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Link, usePathname } from "@/src/i18n";
import RequireAdmin from "@/app/components/RequireAdmin";
import SignOutButton from "@/app/components/SignOutButton";
import { useAuth } from "@/app/context/AuthContext";
import { fetchVerificationQueue } from "@/app/lib/api";

const NAV: ({ href: string; label: string; openCount?: boolean } | { heading: string })[] = [
  { heading: "Today" },
  { href: "/admin", label: "Needs attention" },
  { href: "/admin/requests", label: "Verification requests", openCount: true },
  { heading: "Catalogue" },
  { href: "/admin/scholarships", label: "Scholarships" },
  { href: "/admin/universities", label: "Universities" },
  { href: "/admin/majors", label: "Majors" },
  { href: "/admin/careers", label: "Careers" },
];

/** Requests nobody has answered yet — refreshed on every admin navigation. */
function useOpenRequests(pathname: string): number | null {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchVerificationQueue()
      .then((requests) => {
        if (!cancelled) setOpen(requests.filter((r) => r.status !== "resolved").length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return open;
}

/**
 * Same design language as the public site — powder canvas, white surfaces,
 * Nunito, the brand teal as the one accent — so moving between the two feels
 * like staying in the product rather than leaving it.
 */
function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const { user } = useAuth();
  const open = useOpenRequests(pathname);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-powder text-blue-ink">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky/15">
        <div className="flex items-center gap-3 h-14 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5 shrink-0" aria-label="Domner admin">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-sky-deep text-white text-sm font-extrabold">
              D
            </span>
            <span className="font-display text-base font-extrabold tracking-tight text-blue-ink">Domner</span>
            <span className="rounded-full bg-sitomo px-2 py-0.5 text-[11px] font-bold text-sky-deep">Admin</span>
          </Link>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {open !== null && open > 0 && (
              <Link
                href="/admin/requests"
                className="inline-flex items-center gap-2 rounded-full bg-sky/15 px-3 py-1 text-xs font-bold text-sky-deep hover:bg-sky/25 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-deep" aria-hidden="true" />
                {open} waiting
              </Link>
            )}
            <Link
              href="/"
              className="hidden md:inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-gray-body hover:bg-powder hover:text-blue-ink transition-colors"
            >
              Public site
            </Link>
            {user && (
              <div className="flex items-center gap-2 pl-3 border-l border-sky/15">
                <span className="grid place-items-center w-8 h-8 rounded-full bg-sky-deep text-white text-xs font-bold">
                  {user.name.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <span className="hidden sm:block max-w-[10rem] truncate text-xs font-bold text-blue-ink">
                  {user.name}
                </span>
                <SignOutButton />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[236px_minmax(0,1fr)]">
        <aside className="flex flex-col bg-white lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:border-r lg:border-sky/15">
          <nav
            className="flex lg:flex-col gap-1 px-3 py-3 text-sm overflow-x-auto lg:flex-1 lg:overflow-x-visible"
            aria-label="Admin"
          >
            {NAV.map((item) =>
              "heading" in item ? (
                <p
                  key={item.heading}
                  className="hidden lg:block px-2.5 pt-5 pb-1 text-[11px] font-semibold text-gray-soft"
                >
                  {item.heading}
                </p>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 whitespace-nowrap transition-colors ${
                    isActive(item.href)
                      ? "bg-sky/15 font-bold text-sky-deep"
                      : "font-semibold text-gray-body hover:bg-powder hover:text-blue-ink"
                  }`}
                >
                  {item.label}
                  {item.openCount && open !== null && open > 0 && (
                    <span className="rounded-full bg-sky-deep px-1.5 text-[11px] font-bold text-white">{open}</span>
                  )}
                </Link>
              )
            )}
          </nav>
        </aside>

        <main className="min-w-0 px-5 sm:px-8 py-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

/**
 * Every admin page sits behind RequireAdmin and shares one shell. The guard
 * is for convenience — the API enforces the admin role on every admin action.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAdmin>
      <Shell>{children}</Shell>
    </RequireAdmin>
  );
}
