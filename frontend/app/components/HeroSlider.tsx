"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Pencil,
  Newspaper,
  Building2,
} from "lucide-react";

/* ── 3 Auto-Changing Full-Screen Hero Images ────────────── */
const HERO_IMAGES = [
  {
    // pngtree refuses hotlinked requests (403), so this slide was always blank.
    // Same Unsplash photo the scholarship cards already use as a fallback.
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=2000&auto=format&fit=crop&q=80",
    alt: "University graduates celebrating with diploma",
  },
  {
    src: "https://media.istockphoto.com/id/2229713227/photo/graduates-celebrating-achievement-with-diplomas-in-joyful-ceremony-on-university-campus.jpg?s=2048x2048&w=is&k=20&c=MNPwic-3XmLbQ0GIqFYQNl5NhoVyrnritimHnSooGUs=",
    alt: "Graduates celebrating outdoors at university hall",
  },
  {
    src: "https://media.istockphoto.com/id/2162644436/photo/walking-laughing-and-students-at-university-with-fun-for-learning-bonding-and-talking-people.jpg?s=2048x2048&w=is&k=20&c=0i4Yi7dnphlYa5C6uaSaHPITwuxrqC38AYBhITMXpjU=",
    alt: "Graduates celebrating on university campus with graduation caps",
  },
];

/* ── 3 Feature Columns (EduBlock Style with DOMNER Colors) ── */
const HERO_FEATURES = [
  {
    icon: Pencil,
    title: "Registration",
    description:
      "Explore verified academic majors, admission criteria, and transparent 7-step evaluation pathways.",
    linkText: "Apply now",
    href: "#how-it-works",
  },
  {
    icon: Newspaper,
    title: "Latest news",
    description:
      "Stay updated with official MoEYS announcements, university deadlines, and fresh institutional bulletins.",
    linkText: "Read now",
    href: "/majors",
  },
  {
    icon: Building2,
    title: "Discover us",
    description:
      "Learn how Domner verifies higher education data across Cambodia. 100% free and student-first.",
    linkText: "Learn more",
    href: "#start",
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

  // Auto-change background image every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden select-none pt-24 sm:pt-28"
      aria-label="Homepage hero banner"
    >
      {/* ── FULL-SCREEN BACKGROUND IMAGE (Slow Smooth Slide from Left & Auto-Change) ── */}
      <div
        key={`hero-bg-${imageIndex}`}
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden animate-hero-image-left"
        aria-hidden="true"
      >
        {/* Full Screen Image covering 100% of the viewport width and height */}
        <img
          src={HERO_IMAGES[imageIndex].src}
          alt={HERO_IMAGES[imageIndex].alt}
          className="w-full h-full object-cover object-center"
          loading="eager"
        />

        {/* Directional gradient overlay:
            - Left: Soft powder gradient to guarantee crisp text legibility
            - Center & Right: High transparency so the photo is fully visible edge-to-edge */}
        <div className="absolute inset-0 bg-gradient-to-r from-powder/92 via-powder/60 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-powder/85 via-powder/50 to-transparent" />
      </div>

      {/* ── MAIN CONTENT (Vertically Centered in Full-Screen Hero) ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 w-full flex-1 flex flex-col justify-center py-8 lg:py-12">
        <div className="max-w-2xl lg:max-w-3xl flex flex-col items-start animate-hero-slide-left">
          {/* Sticker Badge */}

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.65rem] font-extrabold text-blue-ink leading-[1.14] tracking-tight mb-5 drop-shadow-xs">
            Figure out your future,
            <br />
            <span className="text-sky-deep">one check at a time.</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg text-gray-body leading-relaxed max-w-xl mb-8 font-medium">
            Domner helps you evaluate, verify, and compare the information you
            find about careers, universities, and scholarships — so you can
            actually trust what you decide.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#start"
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-deep px-7 py-3 text-sm font-bold text-white hover:bg-sky-dark transition-colors bubble-shadow cursor-pointer"
            >
              Start exploring
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-sky/30 bg-white/90 px-7 py-3 text-sm font-bold text-blue-ink hover:bg-white transition-colors cursor-pointer shadow-xs"
            >
              See how it works
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3 FEATURE COLUMNS (EduBlock Style with DOMNER Powder Theme) ── */}
      <div className="relative z-10 w-full bg-powder/85 backdrop-blur-md border-t border-sky/20 pt-7 pb-8 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-sky/25 gap-6 md:gap-0">
            {HERO_FEATURES.map((item, idx) => (
              <div
                key={item.title}
                className={`flex flex-col items-start ${
                  idx === 0 ? "md:pr-8" : idx === 1 ? "md:px-8" : "md:pl-8"
                } py-2 md:py-0`}
              >
                {/* Top Line: Icon + Bold Title */}
                <div className="flex items-center gap-3 mb-2.5">
                  <item.icon
                    className="w-5 h-5 text-sky-deep shrink-0"
                    strokeWidth={2.4}
                  />
                  <h3 className="font-display text-base sm:text-lg font-bold text-blue-ink tracking-tight">
                    {item.title}
                  </h3>
                </div>

                {/* Subtitle / Description */}
                <p className="text-xs sm:text-sm text-gray-body leading-relaxed mb-3.5 font-normal">
                  {item.description}
                </p>

                {/* Action Link with Arrow */}
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-deep hover:text-blue-ink transition-colors group cursor-pointer"
                >
                  {item.linkText}
                  <span
                    className="transition-transform group-hover:translate-x-1"
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
