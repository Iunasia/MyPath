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
} from "lucide-react";

export interface HeaderProps {
  variant?: "default" | "home";
  backHref?: string;
  backLabel?: string;
  showBackArrow?: boolean;
  activeNav?: "home" | "majors" | "careers" | "universities" | "scholarships";
  actions?: React.ReactNode;
  className?: string;
}

export default function Header({
  variant = "default",
  backHref = "/",
  backLabel = "Domner",
  showBackArrow = true,
  activeNav = "majors",
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
            <a
              href="#universities"
              className="text-sm font-semibold text-gray-soft hover:text-blue-ink transition-colors"
            >
              Universities
            </a>
            <a
              href="#scholarships"
              className="text-sm font-semibold text-gray-soft hover:text-blue-ink transition-colors"
            >
              Scholarships
            </a>
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

  // 2. Default App Header (for Major Explorer, All Majors, Major Detail)
  return (
    <div className={`w-full ${className}`}>
      <header className="flex items-center justify-between py-2 mb-8 border-b border-sky/15 pb-4 w-full">
        {/* Left Side: Back Link or Brand */}
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 font-display text-xl sm:text-2xl font-extrabold text-sky tracking-tight hover:opacity-85 transition-opacity cursor-pointer"
          >
            {showBackArrow && <ArrowLeft className="w-5 h-5 text-sky-deep" />}
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* Right Side: Desktop Nav (placed to the left of save icon/actions) + Actions + Mobile Hamburger */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              href="/"
              className={`transition-colors ${
                activeNav === "home"
                  ? "font-bold text-sky-deep border-b-2 border-sky pb-0.5"
                  : "text-gray-soft hover:text-blue-ink"
              }`}
            >
              Home
            </Link>
            <Link
              href="/majors"
              className={`transition-colors ${
                activeNav === "majors"
                  ? "font-bold text-sky-deep border-b-2 border-sky pb-0.5"
                  : "text-gray-soft hover:text-blue-ink"
              }`}
            >
              Majors
            </Link>
            <Link
              href="/careers"
              className={`transition-colors ${
                activeNav === "careers"
                  ? "font-bold text-sky-deep border-b-2 border-sky pb-0.5"
                  : "text-gray-soft hover:text-blue-ink"
              }`}
            >
              Careers
            </Link>
            <Link
              href="/#universities"
              className={`transition-colors ${
                activeNav === "universities"
                  ? "font-bold text-sky-deep border-b-2 border-sky pb-0.5"
                  : "text-gray-soft hover:text-blue-ink"
              }`}
            >
              Universities
            </Link>
            <Link
              href="/#scholarships"
              className={`transition-colors ${
                activeNav === "scholarships"
                  ? "font-bold text-sky-deep border-b-2 border-sky pb-0.5"
                  : "text-gray-soft hover:text-blue-ink"
              }`}
            >
              Scholarships
            </Link>
          </nav>

          {/* Actions (Save Icon, Share Icon) */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-blue-ink hover:bg-sitomo/80 transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Dropdown Menu with Lucide Icons ───────────────── */}
      {menuOpen && (
        <nav className="md:hidden bg-white rounded-2xl p-4 mb-6 bubble-shadow-sm border border-sky/15 animate-fadeIn">
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
              href="/#universities"
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
              href="/#scholarships"
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
          </div>
        </nav>
      )}
    </div>
  );
}

