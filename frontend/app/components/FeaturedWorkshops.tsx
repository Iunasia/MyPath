"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/src/i18n";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  X,
  Lock,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  FEATURED_DOMNER_WORKSHOPS,
  type DomnerWorkshop,
} from "@/app/data/domnerWorkshops";

const getCategoryBadgeStyle = (category: string) => {
  switch (category) {
    case "Career Exploration":
      return "bg-sitomo text-sky-deep border-sky/30";
    case "Choosing the Right Major":
      return "bg-momo text-blue-ink border-momo";
    case "Scholarship Preparation":
      return "bg-powder text-sky-deep border-sky/30";
    case "Digital & Business Skills":
      return "bg-sitomo text-sky-deep border-sky/20";
    default:
      return "bg-sitomo text-sky-deep border-sky/20";
  }
};

export default function FeaturedWorkshops() {
  const t = useTranslations("featuredWorkshops");
  const locale = useLocale();
  const isKm = locale === "km";

  const [selectedWorkshop, setSelectedWorkshop] = useState<DomnerWorkshop | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [premiumSuccess, setPremiumSuccess] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showPremiumModal) {
          setShowPremiumModal(false);
        } else if (selectedWorkshop) {
          setSelectedWorkshop(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPremiumModal, selectedWorkshop]);

  return (
    <section id="workshops" className="py-20 lg:py-24 bg-white dark:bg-background-dark scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* ── Section Header ─────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-blue-ink dark:text-white tracking-tight leading-tight">
              {t("title")}
            </h2>

            <p className="mt-3.5 text-sm sm:text-base text-gray-body dark:text-gray-300 font-medium leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="w-9 h-9 rounded-full bg-white border border-sky/25 hover:border-sky text-sky-deep flex items-center justify-center transition-all shadow-xs hover:bg-sitomo/40 cursor-pointer"
                aria-label={t("scrollLeft")}
                title={t("scrollLeft")}
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="w-9 h-9 rounded-full bg-white border border-sky/25 hover:border-sky text-sky-deep flex items-center justify-center transition-all shadow-xs hover:bg-sitomo/40 cursor-pointer"
                aria-label={t("scrollRight")}
                title={t("scrollRight")}
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>

            <Link
              href="/workshops"
              className="group inline-flex items-center text-sm sm:text-base font-bold text-sky-deep hover:text-[#7AB3B7] dark:text-[#7AB3B7] dark:hover:text-white transition-colors"
            >
              <span>{t("viewAllWorkshops")}</span>
              <ArrowRight
                className="w-0 opacity-0 -translate-x-1 group-hover:w-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-1.5 transition-all duration-200 overflow-hidden shrink-0"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* ── Workshop Cards Carousel (Right scroll like Opportunity page) ── */}
        <div className="relative group/carousel">
          <button
            type="button"
            onClick={() => scroll("right")}
            className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border-2 border-sky/30 text-sky-deep hover:bg-[#7AB3B7] hover:text-white shadow-xl items-center justify-center transition-all cursor-pointer hover:scale-105"
            aria-label={t("scrollRight")}
            title={t("scrollRight")}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-5 pt-1.5 scroll-smooth snap-x snap-mandatory pr-4 sm:pr-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {FEATURED_DOMNER_WORKSHOPS.map((ws) => {
              const title = isKm ? ws.titleKm : ws.title;
              const date = isKm ? ws.dateKm : ws.date;
              const format = isKm ? ws.formatKm : ws.format;

              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => setSelectedWorkshop(ws)}
                  aria-haspopup="dialog"
                  className="w-[260px] sm:w-[280px] md:w-[300px] shrink-0 snap-start group flex flex-col justify-between text-left rounded-2xl p-3.5 sm:p-4 bg-white dark:bg-card-dark border border-sky/20 hover:border-[#7AB3B7] bubble-shadow-sm hover:shadow-xl hover:shadow-slate-300/60 dark:hover:shadow-black/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer h-full"
                >
                  <div>
                    {/* Premium Badge on Left */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#7AB3B7]/30 bg-[#7AB3B7]/15 text-[#5B9DA2] dark:text-[#7AB3B7]">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Premium</span>
                      </span>
                    </div>

                    {/* Poster Image with Gradient & Overlay Badges */}
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-sky/15 shadow-inner mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ws.image}
                        alt={title}
                        width={600}
                        height={375}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                      {/* Top Right Price Tag */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-[#7AB3B7] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/20 shadow-xs">
                          $2.99/mo
                        </span>
                      </div>

                      {/* Bottom Format / Location */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="text-[10px] text-white/95 font-medium truncate block drop-shadow-xs">
                          <MapPin className="w-2.5 h-2.5 text-[#7AB3B7] shrink-0 inline mr-1" aria-hidden="true" />
                          {format}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-sm sm:text-base font-bold text-blue-ink dark:text-white group-hover:text-sky-deep dark:group-hover:text-[#7AB3B7] transition-colors leading-snug line-clamp-2 min-h-[42px]">
                      {title}
                    </h3>

                    {/* Date & Time */}
                    <div className="mt-2 flex items-center gap-1.5 text-gray-soft dark:text-gray-400 text-[10px] sm:text-[11px]">
                      <Calendar className="w-3 h-3 text-[#7AB3B7] shrink-0" />
                      <span className="truncate">{date}</span>
                    </div>
                  </div>

                  {/* Bottom Card Footer */}
                  <div className="mt-3.5 pt-2.5 border-t border-sky/10 flex items-center justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      <Users className="w-3 h-3 text-sky-deep dark:text-[#7AB3B7] shrink-0" />
                      <span className="truncate">{t("limitedSeats")}</span>
                    </div>

                    <span className="shrink-0 inline-flex items-center justify-center px-3 py-1 rounded-xl border border-[#7AB3B7] text-[#7AB3B7] group-hover:bg-[#7AB3B7] group-hover:text-white text-xs font-bold transition-colors shadow-2xs">
                      {t("details")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MODAL 1: Workshop Detail View ────────────────────── */}
      {selectedWorkshop && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedWorkshop(null);
          }}
        >
          <div
            data-lenis-prevent
            className="bg-white dark:bg-panel-raised rounded-3xl max-w-xl w-full p-6 sm:p-8 relative border border-sky/20 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedWorkshop(null)}
              aria-label={t("close")}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 dark:bg-white/10 flex items-center justify-center text-blue-ink dark:text-white hover:bg-sitomo dark:hover:bg-white/20 cursor-pointer z-10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Badges */}
            <div className="mb-3 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span
                  className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full border ${getCategoryBadgeStyle(
                    selectedWorkshop.category
                  )}`}
                >
                  {isKm ? selectedWorkshop.categoryKm : selectedWorkshop.category}
                </span>
                <span className="inline-flex items-center gap-1 bg-[#7AB3B7]/15 text-[#5B9DA2] dark:text-[#7AB3B7] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#7AB3B7]/30">
                  <GraduationCap className="w-3 h-3" />
                  <span>{t("ourWorkshop")}</span>
                </span>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-ink dark:text-white leading-snug">
                {isKm ? selectedWorkshop.titleKm : selectedWorkshop.title}
              </h3>
            </div>

            {/* Poster Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-5 bg-slate-900 border border-sky/15 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedWorkshop.image}
                alt={selectedWorkshop.title}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className="bg-[#7AB3B7] text-white text-xs font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  <span>Premium Access</span>
                </span>
              </div>
            </div>

            {/* Logistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-powder dark:bg-white/5 border border-sky/15 dark:border-white/5 text-xs mb-5">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#7AB3B7] shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-soft dark:text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                    {t("dateTime")}
                  </span>
                  <span className="font-bold text-blue-ink dark:text-white">
                    {isKm ? selectedWorkshop.dateKm : selectedWorkshop.date}
                  </span>
                  <div className="text-gray-body dark:text-gray-300 font-medium">
                    {isKm ? selectedWorkshop.timeKm : selectedWorkshop.time}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#7AB3B7] shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-soft dark:text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                    {t("formatLocation")}
                  </span>
                  <span className="font-bold text-blue-ink dark:text-white">
                    {isKm ? selectedWorkshop.formatKm : selectedWorkshop.format}
                  </span>
                  <div className="text-gray-body dark:text-gray-300 font-medium truncate max-w-[180px]">
                    {isKm ? selectedWorkshop.locationKm : selectedWorkshop.location}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-[#7AB3B7] shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-soft dark:text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                    {t("capacity")}
                  </span>
                  <span className="font-bold text-blue-ink dark:text-white">
                    {isKm ? selectedWorkshop.seatsKm : selectedWorkshop.seats}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-[#7AB3B7] shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-soft dark:text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                    {t("host")}
                  </span>
                  <span className="font-bold text-blue-ink dark:text-white">
                    {t("domnerMentors")}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-soft dark:text-gray-400 mb-1.5">
                {t("overview")}
              </h4>
              <p className="text-xs sm:text-sm text-blue-ink dark:text-white leading-relaxed font-semibold mb-2">
                {isKm ? selectedWorkshop.shortDescriptionKm : selectedWorkshop.shortDescription}
              </p>
              <p className="text-xs sm:text-sm text-gray-body dark:text-gray-200 leading-relaxed font-normal">
                {isKm ? selectedWorkshop.fullDescriptionKm : selectedWorkshop.fullDescription}
              </p>
            </div>

            {/* What You'll Learn Checklist */}
            <div className="p-4 rounded-2xl bg-sitomo/30 dark:bg-sitomo/10 border border-sky/20 dark:border-white/10 mb-6">
              <h4 className="text-xs font-bold text-sky-deep dark:text-[#7AB3B7] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7AB3B7]" />
                <span>{t("whatYoullLearn")}</span>
              </h4>
              <ul className="space-y-2">
                {(isKm ? selectedWorkshop.whatYoullLearnKm : selectedWorkshop.whatYoullLearn).map(
                  (item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-blue-ink dark:text-gray-200 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7AB3B7] shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Register Now CTA */}
            <button
              type="button"
              onClick={() => setShowPremiumModal(true)}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#7AB3B7] hover:bg-[#68A1A5] text-white font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg cursor-pointer group"
            >
              <Lock className="w-4 h-4 text-white/90" />
              <span>{t("registerNow")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Premium Upgrade Popup ───────────────────── */}
      {showPremiumModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPremiumModal(false);
              setPremiumSuccess(false);
            }
          }}
        >
          <div
            data-lenis-prevent
            className="bg-white dark:bg-panel-raised rounded-3xl max-w-md w-full p-6 sm:p-8 relative border border-sky/30 dark:border-white/10 shadow-2xl text-center overscroll-contain"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowPremiumModal(false);
                setPremiumSuccess(false);
              }}
              aria-label={t("close")}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 dark:bg-white/10 flex items-center justify-center text-blue-ink dark:text-white hover:bg-sitomo dark:hover:bg-white/20 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {premiumSuccess ? (
              <div className="py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-400 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-blue-ink dark:text-white mb-2">
                  {isKm ? "សូមស្វាគមន៍មកកាន់ Domner Premium!" : "Welcome to Domner Premium!"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-body dark:text-gray-300 mb-6 font-medium leading-relaxed">
                  {isKm
                    ? "អ្នកបានដោះសោការចូលរៀនសិក្ខាសាលាទាំងអស់ចំនួន ១០ ក្នុងមួយខែ និងធនធានសិក្សាផ្តាច់មុខ។"
                    : "You now have full access to all ~10 monthly workshops, live mentor Q&A, and replays."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowPremiumModal(false);
                    setPremiumSuccess(false);
                    setSelectedWorkshop(null);
                  }}
                  className="w-full py-3 rounded-full bg-[#7AB3B7] hover:bg-[#68A1A5] text-white font-bold text-sm transition-all"
                >
                  {isKm ? "រួចរាល់" : "Done"}
                </button>
              </div>
            ) : (
              <div>
                {/* Lock / Sparkles Badge */}
                <div className="w-16 h-16 rounded-full bg-[#7AB3B7]/15 dark:bg-[#7AB3B7]/25 border-2 border-[#7AB3B7]/40 text-[#7AB3B7] flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Lock className="w-7 h-7" strokeWidth={2.2} />
                </div>

                {/* Badge Label */}
                <span className="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#5B9DA2] dark:text-[#7AB3B7] bg-sitomo dark:bg-sitomo/20 px-3 py-1 rounded-full border border-sky/20 mb-3">
                  {t("premiumBadge")}
                </span>

                {/* Title */}
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-blue-ink dark:text-white mb-3 leading-snug">
                  {t("premiumTitle")}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-body dark:text-gray-300 mb-5 font-medium leading-relaxed">
                  {t("premiumDesc")}
                </p>

                {/* Price Callout */}
                <div className="my-5 p-4 rounded-2xl bg-powder dark:bg-white/5 border border-sky/20 dark:border-white/10">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-display text-4xl sm:text-5xl font-black text-blue-ink dark:text-white">
                      {t("premiumPrice")}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-gray-soft dark:text-gray-400">
                      {t("perMonth")}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-body dark:text-gray-400 font-medium mt-1">
                    {t("cancelAnytime")}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setPremiumSuccess(true)}
                    className="w-full py-3.5 rounded-full bg-[#7AB3B7] hover:bg-[#68A1A5] text-white font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t("upgradeToPremium")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPremiumModal(false);
                      setPremiumSuccess(false);
                    }}
                    className="w-full py-2.5 rounded-full text-xs font-semibold text-gray-soft hover:text-blue-ink dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    {t("maybeLater")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

