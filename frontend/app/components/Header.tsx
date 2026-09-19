"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/src/i18n";
import { useAuth } from "@/app/context/AuthContext";
import { fetchMyVerificationRequests } from "@/app/lib/api";
import SignOutButton from "./SignOutButton";
import Avatar from "./Avatar";
import {
  Menu,
  X,
  BookOpen,
  Compass,
  GraduationCap,
  Coins,
  Bookmark,
  ShieldCheck,
  Users,
  type LucideIcon,
  LayoutDashboard,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  UserCircle,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { UKFlag, CambodiaFlag } from "./FlagIcons";

type NavKey =
  | "careers"
  | "majors"
  | "universities"
  | "scholarships"
  | "opportunities"
  | "workshops"
  | "verify"
  | "saved";

export interface HeaderProps {
  variant?: "default" | "home";
  activeNav?: NavKey;
  className?: string;
}

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

const subscribeToMount = () => () => {};

export default function Header({ variant = "default", activeNav, className = "" }: HeaderProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeToMount, () => true, () => false);
  const isAdmin = user?.role === "admin";
  const unread = useUnreadAnswers(Boolean(user));
  const accountRef = useDismiss(accountOpen, () => setAccountOpen(false));

  const closeMenus = () => {
    setAccountOpen(false);
    setMenuOpen(false);
  };

  const switchLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.replace(pathname, { locale: newLocale });
  };

  const NAV_LINKS: Array<{ key: NavKey; href: string; label: string; icon: LucideIcon }> = [
    { key: "careers", href: "/careers", label: t("careers"), icon: Compass },
    { key: "majors", href: "/majors", label: t("majors"), icon: BookOpen },
    { key: "universities", href: "/universities", label: t("universities"), icon: GraduationCap },
    { key: "scholarships", href: "/scholarships", label: t("scholarships"), icon: Coins },
    { key: "opportunities", href: "/opportunities", label: t("opportunities"), icon: Users },
  ];

  const desktopLink = (active: boolean) =>
    `inline-flex items-center gap-1.5 transition-colors duration-150 ease-out ${
      active
        ? "font-bold text-sky-deep"
        : "text-gray-soft hover:text-sky-deep dark:text-gray-body dark:hover:text-sky-deep"
    }`;
  const mobileLink = (active: boolean) =>
    `group flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors duration-150 ease-out ${
      active
        ? "bg-sky/15 text-sky-deep font-bold"
        : "text-blue-ink hover:bg-powder hover:text-sky-deep"
    }`;

  const position = variant === "home" ? "fixed top-0 inset-x-0" : "sticky top-0";

  return (
    <div className={`${position} z-50 ${className}`}>
      <header className="bg-white/90 backdrop-blur-md border-b border-sky/15 px-[25px] sm:px-10 lg:px-[80px] py-2.5 flex items-center justify-between gap-4">
        {/* The logo is the way home on every page. */}
        <Link href="/" className="flex items-center gap-1 shrink-0" aria-label={t("home")}>
          <div className="relative h-12 sm:h-12 aspect-[207/268] shrink-0 flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Domner Logo"
              width={40}
              height={40}
              priority
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-display text-xl font-extrabold text-[#5B9DA2] tracking-tight hidden sm:block">
            DOMNER
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-semibold" aria-label={t("main")}>
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
            title={t("askToCheckScholarship")}
          >
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            {t("verify")}
            <UnreadBadge count={unread} />
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mounted && theme === "dark" ? tCommon("switchToLightMode") : tCommon("switchToDarkMode")}
            title={mounted && theme === "dark" ? tCommon("switchToLightMode") : tCommon("switchToDarkMode")}
            className="p-2 rounded-full text-blue-ink hover:bg-sitomo transition-colors cursor-pointer"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="w-4.5 h-4.5" aria-hidden="true" />
              ) : (
                <Moon className="w-4.5 h-4.5" aria-hidden="true" />
              )
            ) : (
              <span className="w-4.5 h-4.5 block" aria-hidden="true" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="hidden sm:flex items-center bg-white dark:bg-card-dark border border-sky/20 rounded-md text-xs font-bold overflow-hidden">
            <button
              type="button"
              onClick={() => switchLocale("en")}
              aria-label="English"
              title="English"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 transition-colors cursor-pointer ${
                locale === "en"
                  ? "bg-sky-deep text-white"
                  : "text-gray-soft hover:text-[#7AB3B7] dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              <UKFlag className="w-4 h-2.5 rounded-[1px] shrink-0" />
              <span>EN</span>
            </button>
            <button
              type="button"
              onClick={() => switchLocale("km")}
              aria-label="ខ្មែរ"
              title="ខ្មែរ"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 transition-colors cursor-pointer font-khmer ${
                locale === "km"
                  ? "bg-sky-deep text-white"
                  : "text-gray-soft hover:text-[#7AB3B7] dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              <CambodiaFlag className="w-4 h-2.5 rounded-[1px] shrink-0" />
              <span>ខ្មែរ</span>
            </button>
          </div>

          {loading ? (
            <div className="hidden sm:inline-flex items-center h-[38px] w-[88px] rounded-full bg-sky/15 animate-pulse" />
          ) : user ? (
            <div ref={accountRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label={t("yourAccount")}
                className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 hover:bg-sitomo transition-colors cursor-pointer"
              >
                <Avatar user={user} size={32} className="text-sm" />
                <ChevronDown className="w-3.5 h-3.5 text-gray-soft" aria-hidden="true" />
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-3 w-64 bg-white rounded-lg border border-sky/15 p-2 text-sm font-semibold"
                >
                  <div className="px-3 py-2.5 mb-1 border-b border-sky/10">
                    <p className="font-bold text-blue-ink truncate">{user.name}</p>
                    <p className="text-xs text-gray-soft font-medium truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/verify"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-blue-ink hover:bg-powder transition-colors duration-150 ease-out"
                  >
                    <ShieldCheck className="w-4 h-4 text-sky-deep" />
                    <span className="flex-1">{t("myCheckRequests")}</span>
                    <UnreadBadge count={unread} />
                  </Link>
                  <Link
                    href="/saved"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-blue-ink hover:bg-powder transition-colors duration-150 ease-out"
                  >
                    <Bookmark className="w-4 h-4 text-sky-deep" />
                    {t("saved")}
                  </Link>
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-blue-ink hover:bg-powder transition-colors duration-150 ease-out"
                  >
                    <UserCircle className="w-4 h-4 text-sky-deep" />
                    {t("profile")}
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-blue-ink hover:bg-powder transition-colors duration-150 ease-out"
                    >
                      <LayoutDashboard className="w-4 h-4 text-sky-deep" />
                      {t("adminDashboard")}
                    </Link>
                  )}
                  <SignOutButton variant="block" className="mt-1" onClick={closeMenus} />
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="hidden sm:inline-flex items-center rounded-md bg-[#7AB3B7] px-5 py-2 text-sm font-bold text-white hover:bg-[#68A1A5] transition-colors duration-150 ease-out"
            >
              {tCommon("signIn")}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden relative p-1.5 rounded-full text-blue-ink hover:bg-sitomo transition-colors cursor-pointer"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
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
          className="lg:hidden bg-white/95 backdrop-blur-md rounded-lg p-3 mx-[25px] sm:mx-10 lg:mx-[80px] mb-3 border border-sky/15 text-sm font-semibold"
          aria-label={t("main")}
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
              <span className="flex-1">{t("isThisScholarshipReal")}</span>
              <UnreadBadge count={unread} />
            </Link>
            <Link href="/saved" className={mobileLink(activeNav === "saved")} onClick={() => setMenuOpen(false)}>
              <Bookmark className="w-4 h-4 text-sky-deep" />
              {t("saved")}
            </Link>
          </div>

          {/* Mobile Language Switcher */}
          <div className="mt-2 pt-3 border-t border-sky/10">
            <div className="flex items-center gap-2 px-3.5 mb-2">
              <Globe className="w-4 h-4 text-gray-soft" />
              <button
                type="button"
                onClick={() => switchLocale("en")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  locale === "en"
                    ? "bg-sky-deep text-white"
                    : "text-gray-soft hover:text-[#7AB3B7] bg-powder dark:bg-white/5"
                }`}
              >
                <UKFlag className="w-4 h-2.5 rounded-[1px] shrink-0" />
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => switchLocale("km")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold font-khmer transition-all cursor-pointer ${
                  locale === "km"
                    ? "bg-sky-deep text-white"
                    : "text-gray-soft hover:text-[#7AB3B7] bg-powder dark:bg-white/5"
                }`}
              >
                <CambodiaFlag className="w-4 h-2.5 rounded-[1px] shrink-0" />
                <span>ខ្មែរ</span>
              </button>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-sky/10">
            {loading ? (
              <div className="h-10 w-full rounded-full bg-sky/15 animate-pulse" />
            ) : user ? (
              <div className="flex flex-col gap-1">
                <p className="px-3.5 pb-1 text-xs text-gray-soft font-medium truncate">
                  {tCommon("signIn")} <span className="font-bold text-blue-ink">{user.name}</span>
                </p>
                <Link href="/profile" className={mobileLink(false)} onClick={() => setMenuOpen(false)}>
                  <UserCircle className="w-4 h-4 text-sky-deep" />
                  {t("profile")}
                </Link>
                {isAdmin && (
                  <Link href="/admin" className={mobileLink(false)} onClick={() => setMenuOpen(false)}>
                    <LayoutDashboard className="w-4 h-4 text-sky-deep" />
                    {t("adminDashboard")}
                  </Link>
                )}
                <SignOutButton variant="block" className="mt-1" onClick={closeMenus} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/signin"
                  onClick={() => setMenuOpen(false)}
                  className="text-center rounded-md border border-sky/30 px-4 py-2.5 font-bold text-sky-deep hover:bg-sitomo transition-colors duration-150 ease-out"
                >
                  {tCommon("signIn")}
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  className="text-center rounded-md bg-[#7AB3B7] px-4 py-2.5 font-bold text-white hover:bg-[#68A1A5] transition-colors duration-150 ease-out"
                >
                  {tCommon("createAccount")}
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
