import Link from "next/link";
import Footer from "./components/Footer";
import HeroSlider from "./components/HeroSlider";
import ScholarshipCard from "./components/ScholarshipCard";
import { getScholarships } from "./lib/api.server";
import {
  deadlineState,
  sortByDeadline,
  toScholarshipViews,
  type ScholarshipView,
} from "./lib/adapters";
import WorkshopIcon from "./components/WorkshopIcon";
import {
  Compass,
  Search,
  Scale,
  ShieldCheck,
  ArrowLeftRight,
  FolderTree,
  CheckCircle2,
  Briefcase,
  BookOpen,
  GraduationCap,
  CircleDollarSign,
  RotateCw,
  Link2,
  Zap,
  Sparkles,
} from "lucide-react";

/* ── Wave Divider (inline SVG) ─────────────────────────── */
function WaveTop({ fill = "#E2F1F1" }: { fill?: string }) {
  return (
    <div className="w-full leading-none" aria-hidden="true">
      <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        <path d="M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30V0H0V30Z" fill={fill} />
      </svg>
    </div>
  );
}

function WaveBottom({ fill = "#E2F1F1" }: { fill?: string }) {
  return (
    <div className="w-full leading-none" aria-hidden="true">
      <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        <path d="M0 30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0V30Z" fill={fill} />
      </svg>
    </div>
  );
}

/* ── Data ──────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Careers", href: "/careers" },
  { label: "Majors", href: "/majors" },
  { label: "Universities", href: "/universities" },
  { label: "Scholarships", href: "/scholarships" },
];

const DMIL_STEPS = [
  { icon: Compass, title: "Discover", bg: "bg-sitomo", color: "text-sky-deep" },
  { icon: Search, title: "Search", bg: "bg-momo", color: "text-blue-ink" },
  { icon: Scale, title: "Evaluate", bg: "bg-sitomo", color: "text-blue-ink" },
  // Solid, so the connector line doesn't show through; the ring marks it out.
  { icon: ShieldCheck, title: "Verify", bg: "bg-sitomo", color: "text-blue-ink" },
  { icon: ArrowLeftRight, title: "Compare", bg: "bg-sitomo", color: "text-sky-deep" },
  { icon: FolderTree, title: "Organize", bg: "bg-momo", color: "text-blue-ink" },
  { icon: CheckCircle2, title: "Decide", bg: "bg-sitomo", color: "text-blue-ink" },
];

const DMIL_DESCRIPTIONS = [
  "Explore careers, majors, and opportunities that match your interests.",
  "Find universities, scholarships, and programs from multiple sources.",
  "Assess source credibility, check for conflicts, and judge relevance.",
  "Confirm information against official sources and check freshness.",
  "Weigh what each option offers against the others before you commit.",
  "Save, categorize, and track deadlines for your shortlisted options.",
  "Make a confident, evidence-based decision about your future.",
];

const EXPLORERS = [
  {
    icon: Briefcase,
    title: "Career Explorer",
    description: "Explore careers based on your interests and strengths.",
    chip: "bg-sitomo text-sky-deep",
    border: "border-sky/20",
    href: "/careers",
  },
  {
    icon: BookOpen,
    title: "Major Explorer",
    description: "Discover majors and where they can lead.",
    chip: "bg-momo text-blue-ink",
    border: "border-momo",
    href: "/majors",
  },
  {
    icon: GraduationCap,
    title: "University Explorer",
    description: "Compare universities, programs, and opportunities.",
    chip: "bg-sitomo text-blue-ink",
    border: "border-sitomo",
    href: "/universities",
  },
  {
    icon: CircleDollarSign,
    title: "Scholarship Explorer",
    description: "Discover scholarships that match your goals.",
    chip: "bg-momo text-blue-ink",
    border: "border-momo",
    href: "/scholarships",
  },
  {
    icon: WorkshopIcon,
    title: "Workshops & Mentorship",
    description: "Join workshops, meet mentors, and grow your network.",
    chip: "bg-momo text-blue-ink",
    border: "border-momo",
    href: "/workshops",
  },
];

const TRUST_ITEMS = [
  { icon: RotateCw, title: "7-Step Process", description: "A structured journey from discovery to informed decision.", bg: "bg-sitomo" },
  { icon: Link2, title: "Source Verified", description: "Every claim links back to its original, official source.", bg: "bg-momo" },
  { icon: Zap, title: "Real-Time Checking", description: "Information freshness is always visible and up to date.", bg: "bg-sitomo" },
  { icon: Sparkles, title: "Always Free", description: "Full access for every student. No paywalls, no hidden costs.", bg: "bg-momo" },
];

/* ── Page ──────────────────────────────────────────────── */

/** Rendered per request: "Closing soon" is live data. */
export const dynamic = "force-dynamic";

/** The three open scholarships closing soonest — none if the API is down. */
async function getClosingSoon(): Promise<ScholarshipView[]> {
  try {
    return sortByDeadline(toScholarshipViews(await getScholarships()))
      .filter((s) => deadlineState(s.deadlineAt).kind === "open")
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function Home() {
  const closingSoon = await getClosingSoon();

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Hero Slider (EduBlock Style with Left Slide Animation) ── */}
      <HeroSlider />

      {/* ── Closing soon — real listings, so the home page shows the
          product rather than only describing it ──────────────────── */}
      {closingSoon.length > 0 && (
        <section className="pt-16 lg:pt-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-blue-ink tracking-tight">
                  Closing soon
                </h2>
                <p className="mt-2 text-gray-body font-medium">
                  Open scholarships with the nearest deadlines.
                </p>
              </div>
              <Link
                href="/scholarships"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-deep hover:text-blue-ink shrink-0"
              >
                All scholarships <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {closingSoon.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── DMIL Bubble Path ─────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">

            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-blue-ink tracking-tight mt-4">
              Not just finding information.
              <br />
              <span className="text-gray-faint">Understanding it.</span>
            </h2>
          </div>

          {/* Bubble path — desktop: horizontal, mobile: vertical */}
          <div className="relative">
            {/* Desktop connector line — through the bubbles' centres (half of
                the 4.5rem bubble), from the first bubble to the last: seven
                equal columns put those centres 1/14 in from each edge. It sat
                at the middle of the whole row before, cutting through the
                labels. */}
            <div
              className="hidden lg:block absolute top-9 h-0.5 bg-sky/40 -translate-y-1/2 rounded-full"
              style={{ left: "calc(100% / 14)", right: "calc(100% / 14)" }}
              aria-hidden="true"
            />

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-0">
              {DMIL_STEPS.map((step, i) => (
                <div key={step.title} className="relative z-10 flex flex-col items-center text-center lg:flex-1">
                  {/* Bubble */}
                  <div className={`relative flex items-center justify-center w-16 h-16 lg:w-[4.5rem] lg:h-[4.5rem] rounded-full ${step.bg} ${i === 3 ? "ring-4 ring-sky/35 bubble-shadow" : ""}`}>
                    <step.icon className={`w-7 h-7 lg:w-8 lg:h-8 ${step.color}`} strokeWidth={2.2} aria-hidden="true" />
                    {i === 3 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-sky-deep flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
                        ★
                      </span>
                    )}
                  </div>
                  {/* Label */}
                  <p className="font-display text-sm font-bold text-blue-ink mt-3">{step.title}</p>
                  <p className="text-xs text-gray-soft mt-1 leading-relaxed max-w-[9rem] hidden lg:block">{DMIL_DESCRIPTIONS[i]}</p>

                  {/* Mobile connector */}
                  {i < DMIL_STEPS.length - 1 && (
                    <div className="lg:hidden w-0.5 h-6 bg-sky/20 rounded-full mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WaveTop fill="#E2F1F1" />

      {/* ── Five Explorers ───────────────────────────────── */}
      <section id="explorers" className="py-20 lg:py-28 bg-powder scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-blue-ink tracking-tight">
              Your next chapter starts here.
            </h2>
            <p className="text-sm sm:text-base text-gray-body mt-3 font-medium">
              Explore verified pathways, academic disciplines, institutions, scholarships, and expert workshops.
            </p>
          </div>

          {/* ── Explorers Grid (1 Col Mobile, 3 Col Tablet, 5 Col Desktop — Centered Reference Image Style) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-4.5 lg:gap-5">
            {EXPLORERS.map((e) => (
              <Link
                key={e.title}
                href={e.href}
                className="group flex flex-col items-center text-center rounded-2xl md:rounded-[24px] lg:rounded-[28px] bg-white p-5 sm:p-4.5 md:p-5 lg:p-6 border border-sky/20 hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer h-full"
              >
                {/* Circular Icon Badge */}
                <div
                  className={`w-13 h-13 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-15 lg:h-15 rounded-full ${e.chip} border-2 border-sky/15 flex items-center justify-center mb-3 sm:mb-3.5 md:mb-4 lg:mb-5 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 shrink-0`}
                >
                  <e.icon className="w-6 h-6 sm:w-6 sm:h-6 md:w-6.5 md:h-6.5 lg:w-7.5 lg:h-7.5" strokeWidth={2} aria-hidden="true" />
                </div>

                {/* Title with Arrow on Hover (Symmetrically balanced so title stays dead center) */}
                <h3 className="font-display text-sm sm:text-xs md:text-sm lg:text-base font-extrabold text-blue-ink uppercase tracking-wider group-hover:text-sky-deep transition-colors mb-2 text-center">
                  <span className="inline-flex items-center justify-center">
                    <span className="w-3.5 mr-1 invisible select-none shrink-0" aria-hidden="true">
                      →
                    </span>
                    <span>{e.title}</span>
                    <span
                      className="w-3.5 ml-1 inline-block transition-all duration-200 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-sky-deep font-bold shrink-0 text-left"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </span>
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-xs md:text-xs lg:text-sm text-gray-body leading-relaxed font-normal text-center">
                  {e.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WaveBottom fill="#FFFFFF" />

      {/* ── Information Check ─────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="sticker mb-4">
                <span className="sticker-dot" aria-hidden="true" />
                The feature that makes DMIL visible
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-blue-ink tracking-tight mt-4 mb-5">
                Information Check
              </h2>
              <p className="text-gray-body leading-relaxed mb-6 font-medium">
                Every piece of information on Domner comes with a verification card.
                See where it came from, who provided it, when it was last checked,
                and whether the source is trustworthy — before you act on it.
              </p>
              <ul className="space-y-3 text-sm text-gray-body font-medium">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky/15 text-sky-deep text-xs font-bold mt-0.5 shrink-0" aria-hidden="true">✓</span>
                  Source origin and provider clearly identified
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky/15 text-sky-deep text-xs font-bold mt-0.5 shrink-0" aria-hidden="true">✓</span>
                  Last verification date shown in plain language
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky/15 text-sky-deep text-xs font-bold mt-0.5 shrink-0" aria-hidden="true">✓</span>
                  One-click link to the original source
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-momo text-blue-ink text-xs font-bold mt-0.5 shrink-0" aria-hidden="true">!</span>
                  Report outdated or incorrect information
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white border border-sky/15 p-6 bubble-shadow relative">
              {/* Sticker badge */}
              <div className="absolute -top-3 -right-2 z-10">
                <span className="sticker bg-sitomo border-sky text-blue-ink">
                  <span className="sticker-dot" aria-hidden="true" />
                  Verified
                </span>
              </div>

              <p className="font-display text-base font-bold text-blue-ink mb-0.5">
                ABC University Scholarship
              </p>
              <p className="text-xs text-gray-faint font-semibold mb-5">
                Computer Science · Undergraduate
              </p>

              <div className="rounded-2xl bg-powder border border-sky/10 p-4 mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-faint mb-3">
                  Information Check
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-faint font-semibold">Source</p>
                    <p className="font-bold text-blue-ink">ABC University Official Website</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-faint font-semibold">Provider</p>
                    <p className="font-bold text-blue-ink">ABC University</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-faint font-semibold">Last verified</p>
                    <p className="font-bold text-blue-ink">24 August 2026</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-faint font-semibold">Source status</p>
                    <p className="font-bold text-sky-deep">Verified</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-momo border border-momo p-4 mb-5">
                <p className="text-sm font-bold text-blue-ink mb-1">
                  Why should I trust this information?
                </p>
                <p className="text-xs text-gray-body leading-relaxed font-medium">
                  This information comes from the scholarship provider&apos;s official source
                  and was recently verified.
                </p>
              </div>

              <div className="flex gap-3">
                <a href="#" className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-sky-deep px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-dark transition-colors bubble-shadow-sm">
                  View original source
                  <span aria-hidden="true">↗</span>
                </a>
                <a href="#" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-sky/20 px-4 py-2.5 text-sm font-bold text-gray-soft hover:bg-sky/10 transition-colors">
                  Report
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveTop fill="#E2F1F1" />

      {/* ── Trust Tiles ───────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-powder">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-blue-ink tracking-tight">
              Built on transparency
            </h2>
            <p className="mt-3 text-gray-body max-w-md mx-auto font-medium">
              Every feature is designed to help you understand where information
              comes from and whether you can trust it.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className={`rounded-2xl ${item.bg} p-5 border border-white/60`}>
                <item.icon className="w-7 h-7 text-blue-ink mb-3" strokeWidth={2} aria-hidden="true" />
                <h3 className="font-display text-sm font-bold text-blue-ink mb-1">{item.title}</h3>
                <p className="text-xs text-gray-body leading-relaxed font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveBottom fill="#FFFFFF" />

      {/* ── CTA ───────────────────────────────────────────── */}
      <section id="start" className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-sky/15 via-sitomo/40 to-white">
        {/* Decorative static bubbles */}
        <div className="absolute top-10 left-[10%] w-20 h-20 rounded-full bg-sky/15" aria-hidden="true" />
        <div className="absolute bottom-12 right-[12%] w-14 h-14 rounded-full bg-sitomo" aria-hidden="true" />
        <div className="absolute top-1/2 right-[30%] w-10 h-10 rounded-full bg-momo" aria-hidden="true" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight mb-5">
              Your future deserves more than
              <br />
              <span className="text-sky-deep">a Google search.</span>
            </h2>
            <p className="text-lg text-gray-body max-w-xl mx-auto mb-9 font-medium">
              Join Domner and learn to navigate, evaluate, and verify the information
              that shapes your education and career decisions.
            </p>
            <a href="#" className="inline-flex items-center gap-1.5 rounded-full bg-sky-deep px-8 py-3.5 text-sm font-bold text-white hover:bg-sky-dark transition-colors bubble-shadow">
              Start exploring for free
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
