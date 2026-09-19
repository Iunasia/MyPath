"use client";

import { Suspense, useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/src/i18n";
import { useLenis } from "@/app/context/LenisContext";
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
  UserCheck,
  Megaphone,
  Phone,
  Mail,
  Send,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Footer from "@/app/components/Footer";
import { Button, EmptyState, SearchInput } from "@/app/components/ui";
import {
  DOMNER_WORKSHOPS,
  type DomnerWorkshop,
} from "@/app/data/domnerWorkshops";
import {
  PROMOTE_CONTACT,
  MENTORS_DATA,
  MentorItem,
} from "@/app/data/workshops";

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

function WorkshopsInner() {
  const t = useTranslations("workshops");
  const tFeatured = useTranslations("featuredWorkshops");
  const locale = useLocale();
  const isKm = locale === "km";
  const lenis = useLenis();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const searchQuery = searchParams.get("q") ?? "";
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Modals state
  const [selectedWorkshop, setSelectedWorkshop] = useState<DomnerWorkshop | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [premiumSuccess, setPremiumSuccess] = useState<boolean>(false);

  const [selectedMentor, setSelectedMentor] = useState<MentorItem | null>(null);
  const [showAllMentorsModal, setShowAllMentorsModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [inquirySubmitted, setInquirySubmitted] = useState<boolean>(false);

  const isAnyModalOpen =
    !!selectedWorkshop ||
    showPremiumModal ||
    !!selectedMentor ||
    showAllMentorsModal ||
    showContactModal;

  // Lock lenis & handle Escape
  useEffect(() => {
    if (isAnyModalOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showPremiumModal) setShowPremiumModal(false);
        else if (selectedWorkshop) setSelectedWorkshop(null);
        else if (selectedMentor) setSelectedMentor(null);
        else if (showAllMentorsModal) setShowAllMentorsModal(false);
        else if (showContactModal) setShowContactModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAnyModalOpen, lenis, showPremiumModal, selectedWorkshop, selectedMentor, showAllMentorsModal, showContactModal]);

  const updateUrl = (patch: { q?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const categories = [
    { key: "All", label: isKm ? "ទាំងអស់" : "All" },
    { key: "Career Exploration", label: isKm ? "ការរុករកអាជីព" : "Career Exploration" },
    { key: "Choosing the Right Major", label: isKm ? "ការជ្រើសរើសជំនាញសិក្សា" : "Choosing the Right Major" },
    { key: "Scholarship Preparation", label: isKm ? "ការត្រៀមអាហារូបករណ៍" : "Scholarship Preparation" },
    { key: "Digital & Business Skills", label: isKm ? "ជំនាញឌីជីថល និងអាជីវកម្ម" : "Digital & Business Skills" },
  ];

  const filteredWorkshops = useMemo(() => {
    let list = DOMNER_WORKSHOPS;
    if (selectedCategory !== "All") {
      list = list.filter((ws) => ws.category === selectedCategory);
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter((ws) => {
      const title = (isKm ? ws.titleKm : ws.title).toLowerCase();
      const desc = (isKm ? ws.fullDescriptionKm : ws.fullDescription).toLowerCase();
      const cat = (isKm ? ws.categoryKm : ws.category).toLowerCase();
      return title.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }, [searchQuery, selectedCategory, isKm]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const mentors = MENTORS_DATA;

  const [inquiryOrg, setInquiryOrg] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Promote with Domner — ${inquiryOrg}`;
    const body = `${inquiryMsg}\n\n— ${inquiryOrg}`;
    window.location.href = `mailto:${PROMOTE_CONTACT.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setInquirySubmitted(true);
  };

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        <main className="w-full pb-16 flex flex-col gap-10 sm:gap-12 flex-1">
          
          {/* ── Hero Header ─────────────────────────────────── */}
          <section className="pt-2 sm:pt-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#5B9DA2] tracking-tight leading-[1.15]">
                  {t("heroTitle")}
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-soft mt-3 leading-relaxed font-medium">
                  {t("heroSubtitle")}
                </p>
              </div>

              <div className="w-full lg:max-w-md">
                <SearchInput
                  name="q"
                  size="sm"
                  value={searchQuery}
                  onChange={(value) => updateUrl({ q: value || null })}
                  placeholder={t("searchPlaceholder")}
                  ariaLabel={t("searchPlaceholder")}
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border cursor-pointer ${
                    selectedCategory === cat.key
                      ? "bg-[#7AB3B7] text-white border-[#7AB3B7]"
                      : "bg-white text-gray-soft border-sky/20 hover:border-[#7AB3B7] hover:text-blue-ink"
                  }`}
                >
                  {cat.label}
                  {cat.key === "All" && ` (${DOMNER_WORKSHOPS.length})`}
                </button>
              ))}
            </div>
          </section>

          {/* ── Workshops Carousel (Right scroll like Opportunity page) ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink tracking-tight">
                  {t("workshopsAndOpportunities")}
                </h2>
                {filteredWorkshops.length > 0 && (
                  <p className="text-xs text-gray-soft font-medium mt-0.5 flex items-center gap-1.5">
                    <span>{t("swipeToExplore")}</span>
                    <span className="text-sky-deep font-bold" aria-hidden="true">→</span>
                  </p>
                )}
              </div>

              {filteredWorkshops.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scroll("left")}
                    className="w-9 h-9 rounded-full bg-white border border-sky/25 hover:border-sky text-sky-deep flex items-center justify-center transition-colors hover:bg-sitomo/40 cursor-pointer"
                    aria-label={t("scrollLeft")}
                    title={t("scrollLeft")}
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scroll("right")}
                    className="w-9 h-9 rounded-full bg-white border border-sky/25 hover:border-sky text-sky-deep flex items-center justify-center transition-colors hover:bg-sitomo/40 cursor-pointer"
                    aria-label={t("scrollRight")}
                    title={t("scrollRight")}
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}
            </div>

            {filteredWorkshops.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title={t("noWorkshopsMatch")}
                description={t("noWorkshopsHint")}
                action={
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setSelectedCategory("All");
                      updateUrl({ q: null });
                    }}
                  >
                    {isKm ? "បង្ហាញសិក្ខាសាលាទាំងអស់" : "View All Workshops"}
                  </Button>
                }
              />
            ) : (
              <div className="relative">
                <div
                  ref={scrollContainerRef}
                  className="flex gap-4 sm:gap-5 overflow-x-auto pb-5 pt-1.5 scroll-smooth snap-x snap-mandatory pr-4 sm:pr-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {filteredWorkshops.map((ws) => {
                    const title = isKm ? ws.titleKm : ws.title;
                    const date = isKm ? ws.dateKm : ws.date;
                    const format = isKm ? ws.formatKm : ws.format;

                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => setSelectedWorkshop(ws)}
                        aria-haspopup="dialog"
                        className="w-[260px] sm:w-[280px] md:w-[300px] shrink-0 snap-start group flex flex-col justify-between text-left rounded-lg p-3.5 sm:p-4 bg-white dark:bg-card-dark border border-sky/20 hover:border-[#7AB3B7] transition-colors duration-150 ease-out cursor-pointer h-full"
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
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                            {/* Top Right Price Tag */}
                            <div className="absolute top-2 right-2">
                              <span className="bg-[#7AB3B7] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/20">
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

                          <span className="shrink-0 inline-flex items-center justify-center px-3 py-1 rounded-xl border border-[#7AB3B7] text-[#7AB3B7] group-hover:bg-[#7AB3B7] group-hover:text-white text-xs font-bold transition-colors">
                            {t("details")}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* ── Mentorship & Promote Section ────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-4">
            {/* Left Card: Mentorship */}
            <section className="rounded-lg bg-white border border-sky/15 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-momo/80 flex items-center justify-center shrink-0 border border-momo/60">
                    <UserCheck className="w-6 h-6 text-sky-deep" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                      {t("mentorship")}
                    </h2>
                    <p className="text-xs text-gray-body leading-relaxed mt-1 font-medium">
                      {t("mentorshipDesc")}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-sky/15 border-t border-b border-sky/15 mb-6">
                  {mentors.slice(0, 2).map((mentor) => (
                    <button
                      key={mentor.id}
                      type="button"
                      onClick={() => setSelectedMentor(mentor)}
                      className="w-full text-left p-3 sm:p-3.5 flex items-center justify-between transition-colors bg-white hover:bg-powder/40 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-sky/30 overflow-hidden bg-sitomo/40 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mentor.avatar}
                            alt={mentor.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display text-sm font-bold text-blue-ink group-hover:text-sky-deep transition-colors truncate">
                            {mentor.name}
                          </h3>
                          <p className="text-xs text-gray-soft truncate font-medium">
                            {mentor.role}
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="w-5 h-5 text-blue-ink group-hover:text-sky-deep group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllMentorsModal(true)}
                className="w-full py-2.5 sm:py-3 rounded-full border border-sky text-sky-deep hover:bg-[#7AB3B7] hover:text-white text-xs sm:text-sm font-bold transition-colors text-center cursor-pointer"
              >
                {t("viewAllMentors")}
              </button>
            </section>

            {/* Right Card: Promote With Domner */}
            <section className="rounded-lg bg-white border border-sky/15 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-momo/80 flex items-center justify-center shrink-0 border border-momo/60">
                    <Megaphone className="w-6 h-6 text-sky-deep" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                      {t("promoteWithDomner")}
                    </h2>
                    <p className="text-xs text-gray-body leading-relaxed mt-1 font-medium">
                      {t("promoteDesc")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 mb-6 text-xs sm:text-sm font-semibold text-blue-ink">
                  <a
                    href={`tel:${PROMOTE_CONTACT.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-3 text-gray-body hover:text-sky-deep transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-sitomo/40 flex items-center justify-center shrink-0 text-sky-deep">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>{PROMOTE_CONTACT.phone}</span>
                  </a>

                  <a
                    href={`mailto:${PROMOTE_CONTACT.email}`}
                    className="flex items-center gap-3 text-gray-body hover:text-sky-deep transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-sitomo/40 flex items-center justify-center shrink-0 text-sky-deep">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>{PROMOTE_CONTACT.email}</span>
                  </a>

                  <a
                    href={PROMOTE_CONTACT.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-body hover:text-sky-deep transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-sitomo/40 flex items-center justify-center shrink-0 text-sky-deep">
                      <Send className="w-4 h-4" />
                    </div>
                    <span>{PROMOTE_CONTACT.telegram}</span>
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="w-full py-3 sm:py-3.5 rounded-full bg-[#7AB3B7] hover:bg-[#68A1A5] text-white text-xs sm:text-sm font-bold transition-colors text-center cursor-pointer"
              >
                {t("contactUs")}
              </button>
            </section>
          </div>
        </main>
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
            className="bg-white dark:bg-panel-raised rounded-lg max-w-xl w-full p-6 sm:p-8 relative border border-sky/20 dark:border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain"
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
                  <span>{tFeatured("ourWorkshop")}</span>
                </span>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-ink dark:text-white leading-snug">
                {isKm ? selectedWorkshop.titleKm : selectedWorkshop.title}
              </h3>
            </div>

            {/* Poster Image */}
            <div className="relative rounded-lg overflow-hidden aspect-[16/9] mb-5 bg-slate-900 border border-sky/15 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedWorkshop.image}
                alt={selectedWorkshop.title}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className="bg-[#7AB3B7] text-white text-xs font-extrabold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  <span>Premium Access</span>
                </span>
              </div>
            </div>

            {/* Logistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg bg-powder dark:bg-white/5 border border-sky/15 dark:border-white/5 text-xs mb-5">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#7AB3B7] shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-soft dark:text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                    {tFeatured("dateTime")}
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
                    {tFeatured("formatLocation")}
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
                    {tFeatured("capacity")}
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
                    {tFeatured("host")}
                  </span>
                  <span className="font-bold text-blue-ink dark:text-white">
                    {tFeatured("domnerMentors")}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-soft dark:text-gray-400 mb-1.5">
                {tFeatured("overview")}
              </h4>
              <p className="text-xs sm:text-sm text-blue-ink dark:text-white leading-relaxed font-semibold mb-2">
                {isKm ? selectedWorkshop.shortDescriptionKm : selectedWorkshop.shortDescription}
              </p>
              <p className="text-xs sm:text-sm text-gray-body dark:text-gray-200 leading-relaxed font-normal">
                {isKm ? selectedWorkshop.fullDescriptionKm : selectedWorkshop.fullDescription}
              </p>
            </div>

            {/* What You'll Learn Checklist */}
            <div className="p-4 rounded-md bg-sitomo/30 dark:bg-sitomo/10 border border-sky/20 dark:border-white/10 mb-6">
              <h4 className="text-xs font-bold text-sky-deep dark:text-[#7AB3B7] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7AB3B7]" />
                <span>{tFeatured("whatYoullLearn")}</span>
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
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#7AB3B7] hover:bg-[#68A1A5] text-white font-bold text-sm sm:text-base transition-colors cursor-pointer group"
            >
              <Lock className="w-4 h-4 text-white/90" />
              <span>{tFeatured("registerNow")}</span>
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
            className="bg-white dark:bg-panel-raised rounded-lg max-w-md w-full p-6 sm:p-8 relative border border-sky/30 dark:border-white/10 text-center overscroll-contain"
          >
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
                    : "You now have full access to all 10 monthly workshops, live mentor Q&A, and replays."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowPremiumModal(false);
                    setPremiumSuccess(false);
                    setSelectedWorkshop(null);
                  }}
                  className="w-full py-3 rounded-full bg-[#7AB3B7] hover:bg-[#68A1A5] text-white font-bold text-sm transition-colors"
                >
                  {isKm ? "រួចរាល់" : "Done"}
                </button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 rounded-full bg-[#7AB3B7]/15 dark:bg-[#7AB3B7]/25 border-2 border-[#7AB3B7]/40 text-[#7AB3B7] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7" strokeWidth={2.2} />
                </div>

                <span className="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#5B9DA2] dark:text-[#7AB3B7] bg-sitomo dark:bg-sitomo/20 px-3 py-1 rounded-full border border-sky/20 mb-3">
                  {tFeatured("premiumBadge")}
                </span>

                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-blue-ink dark:text-white mb-3 leading-snug">
                  {tFeatured("premiumTitle")}
                </h3>

                <p className="text-xs sm:text-sm text-gray-body dark:text-gray-300 mb-5 font-medium leading-relaxed">
                  {tFeatured("premiumDesc")}
                </p>

                <div className="my-5 p-4 rounded-lg bg-powder dark:bg-white/5 border border-sky/20 dark:border-white/10">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-display text-4xl sm:text-5xl font-black text-blue-ink dark:text-white">
                      {tFeatured("premiumPrice")}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-gray-soft dark:text-gray-400">
                      {tFeatured("perMonth")}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-body dark:text-gray-400 font-medium mt-1">
                    {tFeatured("cancelAnytime")}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setPremiumSuccess(true)}
                    className="w-full py-3.5 rounded-full bg-[#7AB3B7] hover:bg-[#68A1A5] text-white font-bold text-sm sm:text-base transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{tFeatured("upgradeToPremium")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPremiumModal(false);
                      setPremiumSuccess(false);
                    }}
                    className="w-full py-2.5 rounded-full text-xs font-semibold text-gray-soft hover:text-blue-ink dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    {tFeatured("maybeLater")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 3: All Mentors ─────────────────────────────── */}
      {showAllMentorsModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAllMentorsModal(false);
          }}
        >
          <div
            data-lenis-prevent
            className="bg-white rounded-lg max-w-lg w-full p-6 sm:p-8 relative border border-sky/20 max-h-[85vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain"
          >
            <button
              type="button"
              onClick={() => setShowAllMentorsModal(false)}
              aria-label={t("close")}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 flex items-center justify-center text-blue-ink hover:bg-sitomo cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                {t("verifiedAcademicMentors")}
              </h3>
              <p className="text-xs text-gray-soft mt-1">
                {t("bookConsultation")}
              </p>
            </div>

            <div className="space-y-3">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="rounded-lg border border-sky/25 p-4 flex flex-col gap-3 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky/30 bg-sitomo shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-blue-ink">
                        {mentor.name}
                      </h4>
                      <p className="text-xs text-sky-deep font-semibold">
                        {mentor.role} · {mentor.organization}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-body leading-relaxed font-medium">
                    {mentor.bio}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-sky/10">
                    <span className="text-[11px] text-emerald-700 font-bold">
                      ● {mentor.availableSessions}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowAllMentorsModal(false);
                      }}
                      className="px-4 py-1.5 rounded-full bg-[#7AB3B7] text-white text-xs font-bold hover:bg-[#68A1A5] transition-colors cursor-pointer"
                    >
                      {t("bookSession")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Mentor Booking ─────────────────────────── */}
      {selectedMentor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMentor(null);
          }}
        >
          <div
            data-lenis-prevent
            className="bg-white rounded-lg max-w-md w-full p-6 sm:p-7 relative border border-sky/20 max-h-[90vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain"
          >
            <button
              type="button"
              onClick={() => setSelectedMentor(null)}
              aria-label={t("close")}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 flex items-center justify-center text-blue-ink hover:bg-sitomo cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky/30 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedMentor.avatar}
                  alt={selectedMentor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-blue-ink">
                  {selectedMentor.name}
                </h3>
                <p className="text-xs text-gray-soft">{selectedMentor.role}</p>
              </div>
            </div>

            <div className="p-3 rounded-md bg-powder border border-sky/15 text-xs text-blue-ink mb-4">
              <p className="font-bold text-sky-deep mb-1">{t("focusArea")}</p>
              <p className="font-medium">{selectedMentor.specialty}</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-body leading-relaxed font-medium">
                {t("selectInquiryTopic")}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  className="p-2 rounded-md border border-sky/30 hover:border-sky bg-sitomo/20 text-blue-ink font-bold text-center"
                >
                  {t("majorChoice")}
                </button>
                <button
                  type="button"
                  className="p-2 rounded-md border border-sky/30 hover:border-sky bg-sitomo/20 text-blue-ink font-bold text-center"
                >
                  {t("scholarshipEssay")}
                </button>
              </div>

              <a
                href={PROMOTE_CONTACT.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#7AB3B7] hover:bg-[#68A1A5] text-white font-bold text-xs sm:text-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                {t("connectOnTelegram")}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: Promote Inquiry ────────────────────────── */}
      {showContactModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowContactModal(false);
              setInquirySubmitted(false);
            }
          }}
        >
          <div
            data-lenis-prevent
            className="bg-white rounded-lg max-w-md w-full p-6 sm:p-7 relative border border-sky/20 max-h-[90vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain"
          >
            <button
              type="button"
              onClick={() => {
                setShowContactModal(false);
                setInquirySubmitted(false);
              }}
              aria-label={t("close")}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 flex items-center justify-center text-blue-ink hover:bg-sitomo cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-momo/80 flex items-center justify-center shrink-0">
                <Megaphone className="w-4.5 h-4.5 text-sky-deep" />
              </div>
              <h3 className="font-display text-lg font-bold text-blue-ink">
                {t("promoteOnDomner")}
              </h3>
            </div>

            <p className="text-xs text-gray-body leading-relaxed mb-4 font-medium">
              {t("promoteOnDomnerDesc")}
            </p>

            {inquirySubmitted ? (
              <div className="p-4 rounded-md bg-sitomo border border-sky/20 text-center text-blue-ink text-sm font-medium">
                <p className="font-bold mb-1">{t("emailAppOpened")}</p>
                <p>
                  {t("emailMessageAddressed", { email: PROMOTE_CONTACT.email })}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder={t("institutionOrCompany")}
                  value={inquiryOrg}
                  onChange={(e) => setInquiryOrg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-sky/25 text-xs text-blue-ink focus:outline-none focus:ring-2 focus:ring-sky"
                />
                <textarea
                  required
                  rows={3}
                  placeholder={t("tellUsAboutEvent")}
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-sky/25 text-xs text-blue-ink focus:outline-none focus:ring-2 focus:ring-sky"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-[#7AB3B7] hover:bg-[#68A1A5] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  {t("sendInquiry")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function WorkshopsPage() {
  return (
    <Suspense fallback={null}>
      <WorkshopsInner />
    </Suspense>
  );
}
