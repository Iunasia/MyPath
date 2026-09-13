"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Send,
  UserCheck,
  Megaphone,
  ArrowRight,
  UserCircle2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trophy,
} from "lucide-react";
import Footer from "@/app/components/Footer";
import {
  WORKSHOPS_DATA,
  MENTORS_DATA,
  PROMOTE_CONTACT,
  WorkshopItem,
  MentorItem,
} from "@/app/data/workshops";

/**
 * Category styling strictly using the brand palette:
 * Brand tokens only (see globals.css): hard-coded hexes here bypassed the
 * darker teal the palette moved to, and failed contrast on white.
 */
const getCategoryStyle = (category: string) => {
  switch (category) {
    case "Competition":
      return "bg-momo text-blue-ink border-momo";
    case "Leadership Program":
      return "bg-sitomo text-sky-deep border-sky/30";
    case "Training":
      return "bg-powder text-sky-deep border-sky/30";
    default:
      return "bg-sitomo text-sky-deep border-sky/20";
  }
};

/**
 * Their dates are free text ("30 September 2026", "Maximum capacity reached
 * upon RSVP"). Parse what we can and treat the rest as undated rather than
 * finished. Reads the clock, so it stays out of the component body.
 */
const isFinished = (ws: WorkshopItem): boolean => {
  const match = `${ws.deadline} ${ws.date}`.match(/([0-9]{1,2})[ ]+([A-Za-z]+)[ ]+([0-9]{4})/);
  if (!match) return false;
  const closes = Date.parse(`${match[1]} ${match[2]} ${match[3]} 23:59`);
  return !Number.isNaN(closes) && closes < Date.now();
};

/** Past sessions stay listed, but after the ones people can still join. */
const byFinishedLast = (rows: WorkshopItem[]): WorkshopItem[] =>
  [...rows].sort((a, b) => Number(isFinished(a)) - Number(isFinished(b)));

export default function WorkshopsPage() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopItem | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<MentorItem | null>(null);
  const [showAllMentorsModal, setShowAllMentorsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Form states
  const [inquiryOrg, setInquiryOrg] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");

  /**
   * Hands the message to the sender's own email app. The form used to show
   * "Message received!" on a timer and send nothing anywhere, so an enquiry
   * from a university simply vanished.
   */
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
      {/* ── Page Container (25px mobile, 80px desktop) ── */}
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">

        <main className="w-full pb-16 flex flex-col gap-10 sm:gap-12 flex-1">
          {/* ── Hero Title Section ───────────────────────────── */}
          <section className="text-left pt-2 sm:pt-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#5B9DA2] tracking-tight leading-[1.15] mb-2.5">
              Turn your potential into progress
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-soft font-medium leading-relaxed max-w-xl">
              Learn new skills, meet mentors, join competitions, and explore opportunities made for you.
            </p>
          </section>

          {/* ── Section 1: Workshops & Opportunities (Single Row Horizontal Scroller) ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink tracking-tight">
                  Workshops &amp; Opportunities
                </h2>
                <p className="text-xs text-gray-soft font-medium mt-0.5 flex items-center gap-1.5">
                  <span>Swipe or scroll right to explore all verified opportunities</span>
                  <span className="text-sky-deep font-bold" aria-hidden="true">→</span>
                </p>
              </div>

              {/* Header Scroll Navigation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="w-9 h-9 rounded-full bg-white border border-sky/25 hover:border-sky text-sky-deep flex items-center justify-center transition-all shadow-xs hover:bg-sitomo/40 cursor-pointer"
                  aria-label="Scroll left"
                  title="Scroll left"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="w-9 h-9 rounded-full bg-white border border-sky/25 hover:border-sky text-sky-deep flex items-center justify-center transition-all shadow-xs hover:bg-sitomo/40 cursor-pointer"
                  aria-label="Scroll right"
                  title="Scroll right"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroller Container */}
            <div className="relative group/carousel">
              {/* Floating Right Scroll Button for seamless one-click scrolling */}
              <button
                type="button"
                onClick={() => scroll("right")}
                className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border-2 border-sky/30 text-sky-deep hover:bg-sky hover:text-white shadow-xl items-center justify-center transition-all cursor-pointer hover:scale-105"
                aria-label="Scroll right"
                title="Scroll right"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              </button>

              {/* Scroll Track: Single row, larger width, scrollbar deleted, scroll from right */}
              <div
                ref={scrollContainerRef}
                className="flex gap-4 sm:gap-5 overflow-x-auto pb-5 pt-1.5 scroll-smooth snap-x snap-mandatory pr-4 sm:pr-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {byFinishedLast(WORKSHOPS_DATA).map((ws) => (
                  // A button, not a div: the card opens a dialog, and a div
                  // with onClick cannot be reached or fired from a keyboard.
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => setSelectedWorkshop(ws)}
                    aria-haspopup="dialog"
                    className={`w-[260px] sm:w-[280px] md:w-[300px] shrink-0 snap-start group flex flex-col justify-between text-left rounded-2xl p-3.5 sm:p-4 bg-white border border-sky/20 bubble-shadow-sm hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                      isFinished(ws) ? "opacity-70" : ""
                    }`}
                  >
                    <div>
                      {/* Top Row: Category Pill (Brand colors only) */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getCategoryStyle(
                            ws.category
                          )}`}
                        >
                          {ws.category}
                        </span>
                      </div>

                      {/* Image Poster Preview */}
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-sky/15 shadow-inner mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ws.posterImage}
                          alt={ws.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-2 right-2">
                          <span className="bg-sky text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-white/20 shadow-xs">
                            {ws.price ?? "Free"}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="text-[10px] text-white/95 font-medium truncate block drop-shadow-xs">
                            📍 {ws.location}
                          </span>
                        </div>
                      </div>

                      {/* Title (2 lines clamp) */}
                      <h3 className="font-display text-sm sm:text-base font-bold text-blue-ink group-hover:text-sky-deep transition-colors leading-snug line-clamp-2 min-h-[42px]">
                        {ws.title}
                      </h3>

                      {/* Schedule & Deadline */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-soft text-[10px] sm:text-[11px]">
                          <Calendar className="w-3 h-3 text-sky-deep shrink-0" />
                          <span className="truncate">
                            Deadline: <strong className="text-blue-ink">{ws.deadline}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row: finished state on the left */}
                    <div className="mt-3 pt-2.5 border-t border-sky/10 flex items-center justify-between gap-2">
                      {isFinished(ws) ? (
                        <span className="rounded-full bg-blue-ink/85 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                          Finished
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-xl border border-sky text-sky-deep group-hover:bg-sky-deep group-hover:text-white text-xs font-bold transition-colors shadow-2xs">
                        Details →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Lower Row: Mentorship & Promote With Us ───────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* ── Section 2: Mentorship Card ─────────────────── */}
            <section className="rounded-3xl bg-white border border-sky/15 p-6 sm:p-7 bubble-shadow-sm flex flex-col justify-between">
              <div>
                {/* Header Icon + Titles */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-momo/80 flex items-center justify-center shrink-0 border border-momo/60 shadow-2xs">
                    <UserCheck className="w-6 h-6 text-sky-deep" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                      Mentorship
                    </h2>
                    <p className="text-xs text-gray-body leading-relaxed mt-1 font-medium">
                      Get personal guidance from experienced mentors to explore your career path.
                    </p>
                  </div>
                </div>

                {/* Mentor List Items */}
                <div className="space-y-3 mb-6">
                  {MENTORS_DATA.slice(0, 2).map((mentor) => (
                    <button
                      key={mentor.id}
                      onClick={() => setSelectedMentor(mentor)}
                      className="w-full text-left rounded-2xl border border-sky/35 hover:border-sky p-3 sm:p-3.5 flex items-center justify-between transition-all bg-white hover:bg-sitomo/10 group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-sky/30 overflow-hidden bg-sitomo/40 shrink-0">
                          {mentor.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={mentor.avatar}
                              alt={mentor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-sitomo" />
                          )}
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

              {/* View All Mentors Outlined Button */}
              <button
                onClick={() => setShowAllMentorsModal(true)}
                className="w-full py-2.5 sm:py-3 rounded-full border border-sky text-sky-deep hover:bg-sky hover:text-white text-xs sm:text-sm font-bold transition-all text-center cursor-pointer shadow-2xs"
              >
                View All Mentors
              </button>
            </section>

            {/* ── Section 3: Promote With Us Card ────────────── */}
            <section className="rounded-3xl bg-white border border-sky/15 p-6 sm:p-7 bubble-shadow-sm flex flex-col justify-between">
              <div>
                {/* Header Icon + Titles */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-momo/80 flex items-center justify-center shrink-0 border border-momo/60 shadow-2xs">
                    <Megaphone className="w-6 h-6 text-sky-deep" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                      Promote With Domner
                    </h2>
                    <p className="text-xs text-gray-body leading-relaxed mt-1 font-medium">
                      Want to promote your university, workshop, or educational opportunity on Domner?
                    </p>
                  </div>
                </div>

                {/* Contact List */}
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

              {/* Filled Contact Us Button */}
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full py-3 sm:py-3.5 rounded-full bg-sky-deep hover:bg-sky-dark text-white text-xs sm:text-sm font-bold transition-all text-center shadow-xs cursor-pointer"
              >
                Contact Us
              </button>
            </section>
          </div>
        </main>
      </div>

      {/* ── Modal 1: Workshop & Opportunity Detail Modal ───────── */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 relative border border-sky/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedWorkshop(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 flex items-center justify-center text-blue-ink hover:bg-sitomo cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 pr-8">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${getCategoryStyle(
                    selectedWorkshop.category
                  )}`}
                >
                  {selectedWorkshop.category}
                </span>
                <span className="text-xs font-bold text-gray-soft">
                  {selectedWorkshop.organization}
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                {selectedWorkshop.title}
              </h3>
            </div>

            {/* Poster Preview */}
            <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-4 bg-slate-900 border border-sky/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedWorkshop.posterImage}
                alt={selectedWorkshop.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Sign-up. The modal used to offer no way to register at all,
                behind a handler nothing called. */}
            {selectedWorkshop.applicationLink ? (
              <a
                href={selectedWorkshop.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`mb-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs sm:text-sm transition-colors ${
                  isFinished(selectedWorkshop)
                    ? "bg-sitomo text-sky-deep border border-sky/30 hover:bg-powder"
                    : "bg-sky-deep text-white hover:bg-sky-dark"
                }`}
              >
                {isFinished(selectedWorkshop)
                  ? "View the organiser's page"
                  : "Register on the organiser's site"}
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <p className="mb-4 rounded-2xl bg-momo border border-momo px-4 py-3 text-xs font-medium text-blue-ink">
                No sign-up link yet — ask {selectedWorkshop.organization} directly.
              </p>
            )}

            {isFinished(selectedWorkshop) && (
              <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
                This one has already taken place. It stays here for reference.
              </p>
            )}

            {/* Key Schedule & Venue Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-powder border border-sky/15 text-xs mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-deep shrink-0" />
                <span className="font-medium text-blue-ink">
                  Date: <strong className="font-bold">{selectedWorkshop.date}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-deep shrink-0" />
                <span className="font-medium text-blue-ink">
                  Deadline: <strong className="font-bold">{selectedWorkshop.deadline}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                <MapPin className="w-4 h-4 text-sky-deep shrink-0" />
                <span className="font-medium text-blue-ink">
                  Location: <strong className="font-bold">{selectedWorkshop.location}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                <UserCheck className="w-4 h-4 text-sky-deep shrink-0" />
                <span className="font-medium text-blue-ink">
                  Target Role: <strong className="font-bold">{selectedWorkshop.role}</strong>
                </span>
              </div>
            </div>

            {/* Description (Kept in Detail Modal) */}
            <div className="mb-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-soft mb-1">
                Overview &amp; Description
              </h4>
              <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium">
                {selectedWorkshop.description}
              </p>
            </div>

            {/* Requirements Box (Brand colors) */}
            {selectedWorkshop.requirement && (
              <div className="p-3.5 rounded-2xl bg-sitomo/35 border border-sky/20 mb-4">
                <h4 className="text-xs font-bold text-sky-deep uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Requirements &amp; Eligibility
                </h4>
                <p className="text-xs text-blue-ink leading-relaxed font-medium whitespace-pre-line">
                  {selectedWorkshop.requirement}
                </p>
              </div>
            )}

            {/* Benefits & Prizes Box (Brand colors) */}
            {selectedWorkshop.benefit && (
              <div className="p-3.5 rounded-2xl bg-momo/60 border border-momo/80 mb-5">
                <h4 className="text-xs font-bold text-blue-ink uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-sky-deep" />
                  Benefits &amp; Prizes
                </h4>
                <p className="text-xs text-blue-ink leading-relaxed font-medium whitespace-pre-line">
                  {selectedWorkshop.benefit}
                </p>
              </div>
            )}

            {/* Action Buttons: Apply Link & Source Link */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-sky/15">
              {selectedWorkshop.applicationLink && (
                <a
                  href={selectedWorkshop.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-5 rounded-full bg-sky-deep hover:bg-sky-dark text-white font-bold text-xs sm:text-sm transition-colors text-center shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Apply / Register Here</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {selectedWorkshop.source && selectedWorkshop.source.startsWith("http") && (
                <a
                  href={selectedWorkshop.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3 px-5 rounded-full bg-white border border-sky/30 hover:border-sky text-sky-deep font-bold text-xs sm:text-sm transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Source Post</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: All Mentors Directory ───────────────── */}
      {showAllMentorsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative border border-sky/20 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowAllMentorsModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 flex items-center justify-center text-blue-ink hover:bg-sitomo cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                Verified Academic Mentors
              </h3>
              <p className="text-xs text-gray-soft mt-1">
                Book a 1-on-1 career or university exploration consultation.
              </p>
            </div>

            <div className="space-y-3">
              {MENTORS_DATA.map((mentor) => (
                <div
                  key={mentor.id}
                  className="rounded-2xl border border-sky/25 p-4 flex flex-col gap-3 bg-white"
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
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowAllMentorsModal(false);
                      }}
                      className="px-4 py-1.5 rounded-full bg-sky text-white text-xs font-bold hover:bg-sky-bright transition-colors cursor-pointer"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 3: Mentor Booking ──────────────────────── */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 relative border border-sky/20 shadow-2xl">
            <button
              onClick={() => setSelectedMentor(null)}
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

            <div className="p-3 rounded-2xl bg-powder border border-sky/15 text-xs text-blue-ink mb-4">
              <p className="font-bold text-sky-deep mb-1">Focus Area:</p>
              <p className="font-medium">{selectedMentor.specialty}</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-body leading-relaxed font-medium">
                Select your preferred inquiry topic and our team will connect you via Telegram or Email within 24 hours.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  className="p-2 rounded-xl border border-sky/30 hover:border-sky bg-sitomo/20 text-blue-ink font-bold text-center"
                >
                  Major Choice
                </button>
                <button
                  type="button"
                  className="p-2 rounded-xl border border-sky/30 hover:border-sky bg-sitomo/20 text-blue-ink font-bold text-center"
                >
                  Scholarship Essay
                </button>
              </div>

              <a
                href={PROMOTE_CONTACT.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-sky-deep hover:bg-sky-dark text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                Connect on Telegram
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 4: Promote With Us Inquiry ─────────────── */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 relative border border-sky/20 shadow-2xl">
            <button
              onClick={() => {
                setShowContactModal(false);
                setInquirySubmitted(false);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 flex items-center justify-center text-blue-ink hover:bg-sitomo cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-momo/80 flex items-center justify-center shrink-0">
                <Megaphone className="w-4.5 h-4.5 text-sky-deep" />
              </div>
              <h3 className="font-display text-lg font-bold text-blue-ink">
                Promote on Domner
              </h3>
            </div>

            <p className="text-xs text-gray-body leading-relaxed mb-4 font-medium">
              Feature your academic workshops, university admissions, or scholarships to thousands of active students across Cambodia.
            </p>

            {inquirySubmitted ? (
              <div className="p-4 rounded-2xl bg-sitomo border border-sky/20 text-center text-blue-ink text-sm font-medium">
                <p className="font-bold mb-1">Your email app should have opened</p>
                <p>
                  The message is addressed to {PROMOTE_CONTACT.email}. If nothing opened,
                  write to us there or on Telegram.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Institution or Company Name"
                  value={inquiryOrg}
                  onChange={(e) => setInquiryOrg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky/25 text-xs text-blue-ink focus:outline-none focus:ring-2 focus:ring-sky"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about your event or opportunity..."
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky/25 text-xs text-blue-ink focus:outline-none focus:ring-2 focus:ring-sky"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-sky-deep hover:bg-sky-dark text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
                >
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
