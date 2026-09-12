"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RequireAdmin from "@/app/components/RequireAdmin";
import { useAuth } from "@/app/context/AuthContext";
import { fetchVerificationQueue } from "@/app/lib/api";

const NAV: ({ href: string; label: string; openCount?: boolean } | { heading: string })[] = [
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
 * Same palette as the public site — powder canvas, white surfaces, teal
 * accent — so moving between the two doesn't feel like leaving the product.
 */
function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const { user, logout } = useAuth();
  const open = useOpenRequests(pathname);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-powder text-blue-ink lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="border-b lg:border-b-0 lg:border-r border-sky/20 bg-white lg:sticky lg:top-0 lg:h-screen px-3 py-4 flex flex-col">
        <Link href="/admin" className="flex items-center gap-2 px-2 pb-4">
          <span className="w-7 h-7 rounded-full bg-sky-deep text-white text-xs font-bold font-display grid place-items-center">
            D
          </span>
          <span className="font-display font-extrabold text-blue-ink">Domner</span>
          <span className="rounded-full bg-sitomo px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-deep">
            Admin
          </span>
        </Link>

        <nav className="flex lg:flex-col gap-0.5 overflow-x-auto text-sm" aria-label="Admin">
          {NAV.map((item) =>
            "heading" in item ? (
              <p
                key={item.heading}
                className="hidden lg:block px-2.5 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-soft"
              >
                {item.heading}
              </p>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 whitespace-nowrap transition-colors ${
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

        <div className="hidden lg:block mt-auto pt-4 border-t border-sky/20 text-xs">
          <Link href="/" className="block px-2.5 py-1 font-semibold text-gray-body hover:text-sky-deep">
            View public site ↗
          </Link>
          {user && (
            <div className="px-2.5 pt-2 text-gray-soft">
              Signed in as <span className="font-bold text-blue-ink">{user.name}</span>
              <button
                type="button"
                onClick={() => void logout()}
                className="block mt-1 font-semibold text-gray-body hover:text-sky-deep cursor-pointer"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="min-w-0 px-5 sm:px-8 py-6 lg:py-8">{children}</main>
    </div>
  );
}

/**
 * Every admin page sits behind RequireAdmin and shares one sidebar. The guard
 * is for convenience — the API enforces the admin role on every admin action.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAdmin>
      <Shell>{children}</Shell>
    </RequireAdmin>
  );
}
