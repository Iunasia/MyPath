"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, WaveDivider } from "./ui";

/* ── 3 Auto-Changing Full-Screen Hero Images (Rotating every 6s) ── */
const HERO_IMAGES = [
  {
    src: "https://cadt.edu.kh/wp-content/uploads/2025/09/IMG_4802-copy-scaled.webp",
    fallback: "/images/scholarships/campus.jpg",
    altKey: "alt1",
  },
  {
    src: "/images/scholarships/graduation.jpg",
    fallback: "/images/scholarships/graduation.jpg",
    altKey: "alt2",
  },
  {
    src: "/images/scholarships/technology.jpg",
    fallback: "/images/scholarships/technology.jpg",
    altKey: "alt3",
  },
];

const SLIDE_INTERVAL_MS = 6000;

/* ── HeroSlider ──────────────────────────────────────────── */

export default function HeroSlider() {
  const t = useTranslations("hero");
  const [imageIndex, setImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Respect users who ask for less motion: never auto-advance.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Auto-advance every 6 seconds with loading transition
  useEffect(() => {
    if (isReducedMotion || isPaused) return;

    const timer = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [imageIndex, isPaused, isReducedMotion]);

  return (
    <section
      className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[740px] flex flex-col justify-between overflow-hidden pt-24 sm:pt-32"
      aria-label={t("bannerLabel")}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── FULL-SCREEN BACKGROUND IMAGES (Smooth 6s Cross-Fade) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {HERO_IMAGES.map((img, idx) => {
          const isActive = idx === imageIndex;
          return (
            <div
              key={img.src}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-105 z-0 pointer-events-none"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={t(img.altKey as "alt1" | "alt2" | "alt3")}
                onError={(e) => {
                  if (e.currentTarget.src !== img.fallback) {
                    e.currentTarget.src = img.fallback;
                  }
                }}
                className="w-full h-full min-w-full min-h-full object-cover object-center"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          );
        })}

        {/* Directional gradient overlay: solid readable canvas under text on left, clear photo on right */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-powder via-powder via-45% via-powder/80 via-60% to-transparent to-88% dark:from-[#0A0D12] dark:via-[#0A0D12] dark:via-45% dark:via-[#0A0D12]/80 dark:via-60% dark:to-transparent dark:to-88% hidden sm:block" />
        <div className="absolute inset-0 z-10 bg-powder/92 dark:bg-[#0A0D12]/92 sm:hidden" />
        <div className="absolute bottom-0 inset-x-0 h-16 sm:h-24 z-10 bg-gradient-to-t from-powder dark:from-[#0A0D12] to-transparent" />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center py-12 sm:py-16 lg:py-20">
        <div className="max-w-2xl lg:max-w-3xl flex flex-col items-start animate-hero-slide-left">
          <h1 className="font-display text-[2rem] sm:text-5xl lg:text-[3.65rem] font-extrabold text-blue-ink leading-[1.18] sm:leading-[1.14] tracking-tight mb-4 sm:mb-6">
            {t("headline1")}
            <br />
            <span className="text-[#5B9DA2] font-extrabold">{t("headline2")}</span>
          </h1>

          <p className="text-sm sm:text-lg text-blue-ink/90 dark:text-gray-200 leading-relaxed max-w-xl mb-6 sm:mb-8 font-semibold sm:font-medium">
            {t("subtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
            <Button href="#explorers" size="lg">
              {t("exploreYourPath")} →
            </Button>

            <Button href="#how-it-works" variant="secondary" size="lg">
              {t("seeHowDomnerWorks")}
            </Button>
          </div>

          {/* Slide Indicator Dots with 6s Loading Progress */}
          <div
            className="inline-flex items-center gap-2 mt-8 sm:mt-10 px-2.5 py-1.5 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-xs z-20"
            aria-label={t("heroSlidesLabel")}
          >
            {HERO_IMAGES.map((_, idx) => {
              const isActive = imageIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageIndex(idx)}
                  aria-label={t("switchToSlide", { number: idx + 1 })}
                  aria-current={isActive ? "true" : "false"}
                  className={`group relative h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-deep ${
                    isActive
                      ? "w-8 bg-sky-deep/20 dark:bg-white/20 overflow-hidden"
                      : "w-2.5 bg-sky-deep/35 dark:bg-white/35 hover:bg-sky-deep/60 dark:hover:bg-white/60 hover:scale-110"
                  }`}
                >
                  {isActive && (
                    <span
                      key={`${idx}-${imageIndex}`}
                      className="absolute inset-y-0 left-0 bg-sky-deep dark:bg-sky animate-hero-progress rounded-full"
                      style={{
                        animationPlayState: isPaused ? "paused" : "running",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Smooth Bottom Wave Transition into the white section below ── */}
      <WaveDivider tone="panel" direction="bottom" className="bg-powder" />
    </section>
  );
}