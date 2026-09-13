"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Pencil,
  Newspaper,
  Building2,
} from "lucide-react";

/* ── 3 Auto-Changing Full-Screen Hero Images (High-Res 1600px) ── */
const HERO_IMAGES = [
  {
    src: "https://cadt.edu.kh/wp-content/uploads/2025/09/IMG_4802-copy-scaled.webp",
    alt: "Graduates celebrating graduation on university campus",
  },
  {
    src: "https://i.pinimg.com/1200x/91/4f/e5/914fe50d6a12b42b2aacf6c95dfdf53a.jpg",
    alt: "University students collaborating together outdoors on campus",
  },
  {
    src: "https://i.pinimg.com/1200x/73/72/1a/73721ad2e05a651347d74f3cdea0e0bd.jpg",
    alt: "University students on graduation day on campus",
  },
];

/* ── 3 Feature Columns (EduBlock Style with DOMNER Colors) ── */
const HERO_FEATURES = [
  {
    icon: Pencil,
    title: "Your next step starts here.",
    description:
      "Explore programs, admission requirements, and opportunities you can trust.",
    linkText: "Get started",
    href: "#explorers",
  },
  {
    icon: Newspaper,
    title: "Don’t miss your opportunity.",
    description:
      "Keep up with deadlines, announcements, and the latest opportunities for students.",
    linkText: "Stay updated",
    href: "/majors",
  },
  {
    icon: Building2,
    title: "Information you can trust.",
    description:
      "See how Domner verifies education information for students across Cambodia.",
    linkText: "Learn about Domner",
    href: "#how-it-works",
  },
];

/* ── Wave Divider ──────────────────────────────────────── */
function WaveBottom({ fill = "#FFFFFF" }: { fill?: string }) {
  return (
    <div className="w-full leading-none overflow-hidden bg-powder" aria-hidden="true">
      <svg
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
        preserveAspectRatio="none"
      >
        <path
          d="M0 30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0V30Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

export default function HeroSlider() {
  const [imageIndex, setImageIndex] = useState(0);

  // Auto-change background image: 3s on mobile (<768px), 5s on desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    let intervalMs = mediaQuery.matches ? 3000 : 5000;

    let timer = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, intervalMs);

    const updateTimer = (e: MediaQueryListEvent) => {
      clearInterval(timer);
      intervalMs = e.matches ? 3000 : 5000;
      timer = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
      }, intervalMs);
    };

    mediaQuery.addEventListener("change", updateTimer);
    return () => {
      clearInterval(timer);
      mediaQuery.removeEventListener("change", updateTimer);
    };
  }, []);

  return (
    <section
      className="relative w-full min-h-[580px] sm:min-h-screen sm:min-h-[100dvh] flex flex-col justify-between overflow-hidden select-none pt-20 sm:pt-28"
      aria-label="Homepage hero banner"
    >
      {/* ── FULL-SCREEN BACKGROUND IMAGES (Smooth Cross-Fade Without Flash) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {HERO_IMAGES.map((img, idx) => {
          const isActive = idx === imageIndex;
          return (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Image filling 100% of width and height edge-to-edge */}
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full min-w-full min-h-full object-cover object-center"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          );
        })}

        {/* Directional gradient overlay:
            - Mobile: Soft tint so the photo is vibrant and clear
            - Desktop: Smooth left-to-right fade from canvas to pure untouched photography on the right */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-powder/95 via-powder/80 via-40% to-transparent to-70% hidden sm:block" />
        <div className="absolute inset-0 z-10 bg-powder/35 sm:hidden" />
        <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 z-10 bg-gradient-to-t from-powder via-powder/60 to-transparent" />
      </div>

      {/* ── MAIN CONTENT (Vertically Centered in Full-Screen Hero) ── */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center py-7 sm:py-8 lg:py-12">
        <div className="max-w-2xl lg:max-w-3xl flex flex-col items-start animate-hero-slide-left bg-white/85 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none p-5 sm:p-0 rounded-3xl sm:rounded-none border border-white/70 sm:border-none shadow-lg sm:shadow-none">
          {/* Headline */}
          <h1 className="font-display text-[1.85rem] sm:text-5xl lg:text-[3.65rem] font-extrabold text-blue-ink leading-[1.18] sm:leading-[1.14] tracking-tight mb-3 sm:mb-6">
            Dream big. Check the facts. 
            <br />
            <span className="text-sky-deep">Choose your path.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-gray-body leading-relaxed max-w-xl mb-5 sm:mb-8 font-semibold sm:font-medium">
            Explore careers, universities, majors, and scholarships with confidence. Domner helps you find reliable information, compare your options, and make smarter decisions about your future.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              href="#explorers"
              className="group inline-flex items-center gap-1.5 rounded-full bg-sky-deep px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-bold text-white hover:bg-sky transition-colors bubble-shadow cursor-pointer"
            >
              <span>Exploring your path</span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1"
              >
                →
              </span>
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-sky/30 bg-white/95 px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-bold text-blue-ink hover:bg-white hover:border-sky-deep hover:text-sky-deep transition-all duration-200 cursor-pointer shadow-xs"
            >
              See how Domner works
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3 FEATURE COLUMNS (EduBlock Style with DOMNER Powder Theme — Stays in Row on Mobile) ── */}
      <div className="relative z-10 w-full bg-powder/80 sm:bg-powder/85 backdrop-blur-md border-t border-sky/20 pt-3 pb-3.5 sm:pt-4.5 sm:pb-5 md:pt-5 md:pb-6 lg:pt-7 lg:pb-8 px-2.5 sm:px-5 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 divide-x divide-sky/25 gap-0">
            {HERO_FEATURES.map((item, idx) => (
              <div
                key={item.title}
                className={`group flex flex-col items-start ${
                  idx === 0
                    ? "pr-2 sm:pr-3.5 md:pr-5 lg:pr-8"
                    : idx === 1
                    ? "px-2 sm:px-3.5 md:px-5 lg:px-8"
                    : "pl-2 sm:pl-3.5 md:pl-5 lg:pl-8"
                } py-0.5 sm:py-1.5 md:py-0`}
              >
                {/* Top Line: Icon + Bold Title (Clickable) */}
                <Link
                  href={item.href}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2.5 md:gap-3 mb-1 sm:mb-2 md:mb-2.5 cursor-pointer"
                >
                  <item.icon
                    className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-sky-deep shrink-0"
                    strokeWidth={2.4}
                  />
                  <h3 className="font-display text-[10px] sm:text-xs md:text-base lg:text-lg font-bold text-blue-ink tracking-tight leading-snug sm:leading-tight group-hover:text-sky-deep transition-colors">
                    {item.title}
                  </h3>
                </Link>

                {/* Description */}
                <p className="text-[9.5px] sm:text-[11px] md:text-xs lg:text-sm text-gray-body leading-snug sm:leading-relaxed mb-1.5 sm:mb-2.5 md:mb-3 lg:mb-3.5 font-normal">
                  {item.description}
                </p>

                {/* Action Link (arrow revealed on hover, visible on mobile) */}
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-0.5 text-[9.5px] sm:text-xs md:text-xs lg:text-sm font-bold text-sky-deep hover:text-sky transition-colors cursor-pointer mt-auto"
                >
                  <span>{item.linkText}</span>
                  <span
                    className="inline-block sm:opacity-0 sm:-translate-x-2 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300 ease-out"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Smooth Bottom Wave Transition into #how-it-works White ── */}
      <WaveBottom fill="#FFFFFF" />
    </section>
  );
}
