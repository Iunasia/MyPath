"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { fetchMyVerificationRequests } from "@/app/lib/api";
import {
  Menu,
  X,
  BookOpen,
  Compass,
  GraduationCap,
  Coins,
  Bookmark,
  ShieldCheck,
  Scale,
  Users,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

type NavKey =
  | "careers"
  | "majors"
  | "universities"
  | "scholarships"
  | "workshops"
  | "verify"
  | "saved";

export interface HeaderProps {
  /**
   * "home" floats the header over the hero image; everywhere else it sits at
   * the top of the page and sticks on scroll. What's inside is identical.
   */
  variant?: "default" | "home";
  activeNav?: NavKey;
  className?: string;
}

const NAV_LINKS: Array<{ key: NavKey; href: string; label: string; icon: LucideIcon }> = [
  { key: "careers", href: "/careers", label: "Careers", icon: Compass },
  { key: "majors", href: "/majors", label: "Majors", icon: BookOpen },
  { key: "universities", href: "/universities", label: "Universities", icon: GraduationCap },
  { key: "scholarships", href: "/scholarships", label: "Scholarships", icon: Coins },
  { key: "workshops", href: "/workshops", label: "Workshops", icon: Users },
];

/**
 * How many answers to "is this real?" the student hasn't opened yet. Answers
 * land in the inbox on /verify, and without a badge nobody would know to look.
 */
function useUnreadAnswers(signedIn: boolean): number {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    fetchMyVerificationRequests()
      .then((inbox) => {
        if (!cancelled) setUnread(inbox.unread);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  return signedIn ? unread : 0;
}

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-sky-deep text-white text-[10px] font-extrabold leading-none"
      aria-label={`${count} new answer${count === 1 ? "" : "s"}`}
    >
      {count}
    </span>
  );
}

/** Closes a popover on an outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return ref;
}

export default function Header({ variant = "default", activeNav, className = "" }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  // Cosmetic only — the guard on /admin is what actually protects the page.
  const isAdmin = user?.role === "admin";
  const unread = useUnreadAnswers(Boolean(user));
  const accountRef = useDismiss(accountOpen, () => setAccountOpen(false));

  const signOut = async () => {
    setAccountOpen(false);
    setMenuOpen(false);
    await logout();
  };

  const desktopLink = (active: boolean) =>
    `inline-flex items-center gap-1.5 transition-colors ${
      active ? "font-bold text-sky-deep" : "text-gray-soft hover:text-blue-ink"
    }`;
  const mobileLink = (active: boolean) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
      active ? "bg-sky/15 text-sky-deep font-bold" : "text-blue-ink hover:bg-powder"
    }`;

  // Rendered once from the root layout (see SiteHeader), outside the pages'
  // padded containers, so it carries the same side margins itself.
  const position =
    variant === "home"
      ? "fixed top-4 inset-x-[25px] sm:inset-x-10 lg:inset-x-[80px]"
      : "sticky top-3.5 mt-6 mb-2 mx-[25px] sm:mx-10 lg:mx-[80px]";

  return (
    <div className={`${position} z-50 ${className}`}>
      <header className="bg-white/90 backdrop-blur-md rounded-full bubble-shadow-sm border border-sky/15 pl-4 pr-3 sm:pl-5 sm:pr-4 py-2.5 flex items-center justify-between gap-4">
        {/* The logo is the way home on every page. */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Domner home">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-deep text-white text-sm font-bold font-display">
            D
          </span>
          <span className="font-display text-lg font-bold text-blue-ink tracking-tight hidden sm:block">
            DOMNER
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-semibold" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={desktopLink(activeNav === link.key)}
              aria-current={activeNav === link.key ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/verify"
            className={desktopLink(activeNav === "verify")}
            aria-current={activeNav === "verify" ? "page" : undefined}
            title="Ask us to check whether a scholarship is real"
          >
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            Verify
            <UnreadBadge count={unread} />
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Nothing until the session check finishes, so a signed-in student
              never sees "Sign in" flash up. */}
          {!loading &&
            (user ? (
              <div ref={accountRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-label="Your account"
                  className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 hover:bg-sitomo transition-colors cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-full bg-sky-deep text-white text-sm font-bold flex items-center justify-center">
                    {user.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-soft" aria-hidden="true" />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl border border-sky/15 bubble-shadow p-2 text-sm font-semibold"
                  >
                    <div className="px-3 py-2.5 mb-1 border-b border-sky/10">
                      <p className="font-bold text-blue-ink truncate">{user.name}</p>
                      <p className="text-xs text-gray-soft font-medium truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/verify"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-ink hover:bg-powder"
                    >
                      <ShieldCheck className="w-4 h-4 text-sky-deep" />
                      <span className="flex-1">My check requests</span>
                      <UnreadBadge count={unread} />
                    </Link>
                    <Link
                      href="/saved"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-ink hover:bg-powder"
                    >
                      <Bookmark className="w-4 h-4 text-sky-deep" />
                      Saved items
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-ink hover:bg-powder"
                      >
                        <LayoutDashboard className="w-4 h-4 text-sky-deep" />
                        Admin dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={signOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl text-blue-ink hover:bg-powder border-t border-sky/10 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-gray-soft" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="hidden sm:inline-flex items-center rounded-full bg-sky-deep px-5 py-2 text-sm font-bold text-white hover:bg-sky-dark transition-colors"
              >
                Sign in
              </Link>
            ))}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden relative p-1.5 rounded-full text-blue-ink hover:bg-sitomo transition-colors cursor-pointer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {!menuOpen && unread > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-sky-deep" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav
          className="lg:hidden bg-white/95 backdrop-blur-md rounded-3xl p-3 mt-3 bubble-shadow-sm border border-sky/15 text-sm font-semibold"
          aria-label="Main"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={mobileLink(activeNav === link.key)}
                onClick={() => setMenuOpen(false)}
              >
                <link.icon className="w-4 h-4 text-sky-deep" />
                {link.label}
              </Link>
            ))}
            <Link href="/verify" className={mobileLink(activeNav === "verify")} onClick={() => setMenuOpen(false)}>
              <ShieldCheck className="w-4 h-4 text-sky-deep" />
              <span className="flex-1">Is this scholarship real?</span>
              <UnreadBadge count={unread} />
            </Link>
            <Link href="/saved" className={mobileLink(activeNav === "saved")} onClick={() => setMenuOpen(false)}>
              <Bookmark className="w-4 h-4 text-sky-deep" />
              Saved items
            </Link>
          </div>

          {!loading && (
            <div className="mt-2 pt-3 border-t border-sky/10">
              {user ? (
                <div className="flex flex-col gap-1">
                  <p className="px-3.5 pb-1 text-xs text-gray-soft font-medium truncate">
                    Signed in as <span className="font-bold text-blue-ink">{user.name}</span>
                  </p>
                  {isAdmin && (
                    <Link href="/admin" className={mobileLink(false)} onClick={() => setMenuOpen(false)}>
                      <LayoutDashboard className="w-4 h-4 text-sky-deep" />
                      Admin dashboard
                    </Link>
                  )}
                  <button type="button" onClick={signOut} className={`${mobileLink(false)} w-full cursor-pointer`}>
                    <LogOut className="w-4 h-4 text-gray-soft" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/signin"
                    onClick={() => setMenuOpen(false)}
                    className="text-center rounded-full border border-sky/30 px-4 py-2.5 font-bold text-sky-deep hover:bg-sitomo transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMenuOpen(false)}
                    className="text-center rounded-full bg-sky-deep px-4 py-2.5 font-bold text-white hover:bg-sky-dark transition-colors"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      )}
    </div>
  );
}
