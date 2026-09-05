"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Menu,
  X,
  Home,
  BookOpen,
  Compass,
  GraduationCap,
  Coins,
  Bookmark,
} from "lucide-react";

export interface HeaderProps {
  variant?: "default" | "home";
  backHref?: string;
  backLabel?: string;
  showBackArrow?: boolean;
  activeNav?: "home" | "careers" | "majors" | "universities" | "scholarships";
  showSaveIcon?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export default function Header({
  variant = "default",
  backHref = "/",
  backLabel = "DOMNER",
  showBackArrow = false,
  activeNav = "careers",
  showSaveIcon = true,
  actions,
  className = "",
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // 1. Floating Pill Navbar for Homepage
  if (variant === "home") {
    return (
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl ${className}`}>
        <div className="bg-white/90 backdrop-blur-md rounded-full bubble-shadow-sm border border-sky/10 px-5 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky text-white text-sm font-bold font-display">
              D
            </span>
            <span className="font-display text-lg font-bold text-blue-ink tracking-tight hidden sm:block">
              DOMNER
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/careers"
              className="text-sm font-semibold text-gray-soft hover:text-blue-ink transition-colors"
            >
              Careers
            </Link>
            <Link
              href="/majors"
              className="text-sm font-semibold text-gray-soft hover:text-blue-ink transition-colors"
            >
              Majors
            </Link>
            <Link
              href="/universities"
              className="text-sm font-semibold text-gray-soft hover:text-blue-ink transition-colors"
            >
              Universities
            </Link>
            <Link
              href="/scholarships"
              className="text-sm font-semibold text-gray-soft hover:text-blue-ink transition-colors"
            >
              Scholarships
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/signin"
              className="hidden sm:inline-flex text-sm font-semibold text-gray-soft hover:text-blue-ink transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-sky px-5 py-2 text-sm font-bold text-white hover:bg-sky-bright transition-colors bubble-shadow-sm"
            >
              Get started
              <span aria-hidden="true" className="text-xs">
                →
              </span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // 2. Default App Header (Exact Homepage Pill Style: Sticky, Rounded-Full, Frosted Glass)
  return (
    <div className={`sticky top-3.5 z-50 w-full mb-8 ${className}`}>
      <header className="bg-white/90 backdrop-blur-md rounded-full bubble-shadow-sm border border-sky/15 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between w-full transition-all">
        {/* Left Side: Brand Logo or Back Link */}
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            {showBackArrow ? (
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sitomo text-sky-deep group-hover:bg-sky group-hover:text-white transition-all shadow-2xs">
                <ArrowLeft className="w-4 h-4" strokeWidth={2.4} />
              </span>
            ) : (
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky text-white text-sm font-bold font-display shadow-2xs">
                D
              </span>
            )}
            <span className="font-display text-base sm:text-lg font-bold text-blue-ink tracking-tight group-hover:text-sky-deep transition-colors">
              {backLabel}
            </span>
          </Link>
        </div>

        {/* Right Side: Desktop Nav (placed to the left of save icon) + Actions + Mobile Hamburger */}
        <div className="flex items-center gap-5 sm:gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              href="/"
              className={`transition-colors ${
                activeNav === "home"
                  ? "font-bold text-sky-deep"
                  : "text-gray-soft hover:text-blue-ink"
              }`}
            >
              Home
            </Link>
            <Link
              href="/careers"
              className={`transition-colors ${
                activeNav === "careers"
                  ? "font-bold text-sky-deep"
                  : "text-gray-soft hover:text-blue-ink"
              }`}
            >
              Careers
            </Link>
            <Link
              href="/majors"
              className={`transition-colors ${
                activeNav === "majors"
                  ? "font-bold text-sky-deep"
                  : "text-gray-soft hover:text-blue-ink"
              }`}
            >
              Majors
            </Link>
            <Link
              href="/universities"
              className={`transition-colors ${
                activeNav === "universities"
                  ? "font-bold text-sky-deep"
                  : "text-gray-soft hover:text-blue-ink"
              }`}
            >
              Universities
            </Link>
            <Link
              href="/scholarships"
              className={`transition-colors ${
                activeNav === "scholarships"
                  ? "font-bold text-sky-deep"
                  : "text-gray-soft hover:text-blue-ink"
              }`}
            >
              Scholarships
            </Link>
          </nav>

          {/* Save / Bookmark Icon */}
          {showSaveIcon && !actions && (
            <button
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sitomo text-sky-deep border border-sky/20 hover:bg-sky hover:text-white transition-all flex items-center justify-center focus:outline-none cursor-pointer shadow-2xs"
              aria-label="Save"
              title="Save to favorites"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}

          {/* Optional Actions (e.g. Share Icon) */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1.5 rounded-full text-blue-ink hover:bg-sitomo/80 transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Dropdown Menu with Lucide Icons ───────────────── */}
      {menuOpen && (
        <nav className="md:hidden bg-white/95 backdrop-blur-md rounded-3xl p-4 mt-3 bubble-shadow-sm border border-sky/15 animate-fadeIn">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-soft mb-2 px-2">
            Navigation
          </p>
          <div className="flex flex-col gap-1 text-sm font-semibold">
            <Link
              href="/"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                activeNav === "home"
                  ? "bg-sky/15 text-sky-deep font-bold"
                  : "text-blue-ink hover:bg-powder"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Home className="w-4 h-4 text-sky-deep" />
              <span>Home</span>
            </Link>
            <Link
              href="/careers"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                activeNav === "careers"
                  ? "bg-sky/15 text-sky-deep font-bold"
                  : "text-blue-ink hover:bg-powder"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Compass className="w-4 h-4 text-sky-deep" />
              <span>Career Explorer</span>
            </Link>
            <Link
              href="/majors"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                activeNav === "majors"
                  ? "bg-sky/15 text-sky-deep font-bold"
                  : "text-blue-ink hover:bg-powder"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <BookOpen className="w-4 h-4 text-sky-deep" />
              <span>Major Explorer</span>
            </Link>
            <Link
              href="/universities"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                activeNav === "universities"
                  ? "bg-sky/15 text-sky-deep font-bold"
                  : "text-blue-ink hover:bg-powder"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <GraduationCap className="w-4 h-4 text-sky-deep" />
              <span>Universities</span>
            </Link>
            <Link
              href="/scholarships"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                activeNav === "scholarships"
                  ? "bg-sky/15 text-sky-deep font-bold"
                  : "text-blue-ink hover:bg-powder"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Coins className="w-4 h-4 text-sky-deep" />
              <span>Scholarships</span>
            </Link>

            {showSaveIcon && (
              <Link
                href="#"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-blue-ink hover:bg-powder border-t border-sky/10 mt-1 pt-2.5"
                onClick={() => setMenuOpen(false)}
              >
                <Bookmark className="w-4 h-4 text-sky-deep" />
                <span>Saved Items</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
