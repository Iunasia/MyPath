import Link from "next/link";
import Footer from "./components/Footer";
import HeroSlider from "./components/HeroSlider";
import ScholarshipCard from "./components/ScholarshipCard";
import InformationCheckDemo from "./components/InformationCheckDemo";
import InteractiveCTA from "./components/InteractiveCTA";
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
  ArrowRight,
  ShieldAlert,
  Building2,
  CalendarCheck,
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

const DMIL_STEPS = [
  { icon: Compass, title: "Discover", bg: "bg-sitomo", color: "text-sky-deep" },
  { icon: Search, title: "Search", bg: "bg-momo", color: "text-blue-ink" },
  { icon: Scale, title: "Evaluate", bg: "bg-sitomo", color: "text-blue-ink" },
  // Solid, so the connector line doesn't show through; the ring marks it out.
  { icon: ShieldCheck, title: "Verify", bg: "bg-sky/25", color: "text-blue-ink" },
  { icon: ArrowLeftRight, title: "Compare", bg: "bg-sitomo", color: "text-sky-deep" },
  { icon: FolderTree, title: "Organize", bg: "bg-momo", color: "text-blue-ink" },
  { icon: CheckCircle2, title: "Decide", bg: "bg-sitomo", color: "text-blue-ink" },
];

const DMIL_DESCRIPTIONS = [
  "Start with what excites you and explore matching pathways.",
  "Find verified universities, majors, and scholarships across Cambodia.",
  "Look beyond the headline to check credibility and relevance.",
  "Confirm important details against official and trusted sources.",
  "Put your top options side by side to see what fits you best.",
  "Save your favorite paths and track upcoming deadlines easily.",
  "Turn verified information into confident choices for your future.",
];

const MOBILE_STEP_POSITIONS = [
  { top: 16, isLeft: true },   // Step 1: Discover (Row 1 Left)
  { top: 16, isLeft: false },  // Step 2: Search (Row 1 Right)
  { top: 196, isLeft: true },  // Step 3: Evaluate (Row 2 Left)
  { top: 376, isLeft: false }, // Step 4: Verify (Row 3 Right)
  { top: 556, isLeft: true },  // Step 5: Compare (Row 4 Left)
  { top: 736, isLeft: false }, // Step 6: Organize (Row 5 Right)
  { top: 916, isLeft: true },  // Step 7: Decide (Row 6 Left)
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

      {/* ── DMIL Step Flow (Numbered Steps with Dashed Line, No Icons) ── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Centered Heading matching screenshot style */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-blue-ink tracking-tight">
              Don’t just find answers.
              <br />
              <span className="text-sky-deep">Know you can trust them.</span>
            </h2>
          </div>

          {/* ── Desktop & Tablet View: Horizontal 7-Step Row with Curled Dashed Connector ── */}
          <div className="hidden md:block relative pt-2">
            {/* Curled Dashed Connector Wave */}
            <div
              className="absolute top-1 left-0 right-0 h-12 md:h-14 lg:h-16 pointer-events-none z-0"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 1000 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M 71 28
                     C 130 46, 165 46, 214 24
                     C 265 6, 305 6, 357 30
                     C 410 48, 450 48, 500 22
                     C 550 6, 590 6, 643 30
                     C 695 48, 735 48, 786 24
                     C 835 6, 870 6, 929 28"
                  stroke="#7AB3B7"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </svg>
            </div>

            <div className="flex flex-row items-start justify-between">
              {DMIL_STEPS.map((step, i) => {
                // Subtle undulating vertical offsets matching the wave curve
                const offsetClass =
                  i % 2 === 1 ? "-translate-y-1 md:-translate-y-1.5" : "translate-y-0.5";

                return (
                  <div
                    key={`desktop-${step.title}`}
                    className={`group flex flex-col items-center text-center flex-1 relative z-10 transition-transform ${offsetClass}`}
                  >
                    {/* Step Number Circle (No Icon, Just Step Number) */}
                    <div className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-white border-2 border-sky/30 shadow-md shadow-slate-200/60 group-hover:border-sky-deep group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      <span className="font-display font-extrabold text-sm md:text-base lg:text-xl text-blue-ink group-hover:text-sky-deep transition-colors">
                        {i + 1}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="font-display text-xs md:text-sm lg:text-base font-bold text-blue-ink mt-2 md:mt-3 lg:mt-4 mb-1 md:mb-1.5 group-hover:text-sky-deep transition-colors">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-[10px] md:text-[11px] lg:text-xs text-gray-body leading-snug md:leading-relaxed max-w-[95px] md:max-w-[115px] lg:max-w-[135px] mx-auto font-normal">
                      {DMIL_DESCRIPTIONS[i]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Mobile View: DOMNER Winding Road / Journey Switchback (Mobile only, < md) ── */}
          <div className="md:hidden relative w-[330px] mx-auto h-[1080px] pt-1">
            {/* SVG Dashed Connecting Line (Winding Switchback Road - Clean of Text) */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 330 1080"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d="M 66 44 L 264 44
                     M 264 158 L 264 196 A 28 28 0 0 1 236 224 L 66 224
                     M 66 338 L 66 376 A 28 28 0 0 0 94 404 L 264 404
                     M 264 518 L 264 556 A 28 28 0 0 1 236 584 L 66 584
                     M 66 698 L 66 736 A 28 28 0 0 0 94 764 L 264 764
                     M 264 878 L 264 916 A 28 28 0 0 1 236 944 L 66 944"
                  stroke="#7AB3B7"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* 7 DOMNER Journey Steps */}
            {DMIL_STEPS.map((step, i) => {
              const pos = MOBILE_STEP_POSITIONS[i];

              return (
                <div
                  key={`mobile-${step.title}`}
                  style={{ top: `${pos.top}px` }}
                  className={`absolute ${
                    pos.isLeft ? "left-0.5" : "right-0.5"
                  } w-[132px] flex flex-col items-center text-center z-10 group`}
                >
                  {/* Step Number Circle */}
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-sky/35 shadow-md shadow-slate-200/60 group-hover:border-sky-deep group-hover:scale-105 transition-all duration-300 shrink-0">
                    <span className="font-display font-extrabold text-lg text-blue-ink group-hover:text-sky-deep transition-colors">
                      {i + 1}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-display text-sm font-bold text-blue-ink mt-2.5 mb-1 group-hover:text-sky-deep transition-colors">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-[11px] text-gray-body leading-relaxed font-normal">
                    {DMIL_DESCRIPTIONS[i]}
                  </p>
                </div>
              );
            })}
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
      <section className="py-20 lg:py-28 bg-white scroll-mt-20" id="verification">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-sitomo px-3.5 py-1 text-xs font-bold text-sky-deep border border-sky/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span>DMIL Verification Engine</span>
              </div>
              
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-blue-ink tracking-tight mt-1 mb-4 leading-tight">
                Information Check. <br />
                <span className="text-sky-deep">Real data. Zero guesswork.</span>
              </h2>

              <p className="text-gray-body leading-relaxed mb-7 font-medium text-sm sm:text-base">
                Every scholarship, major, and university on Domner is verified against official ministry (.gov.kh) and accredited institutional (.edu.kh) records before you act.
              </p>

              {/* 3 Essential Focus Points */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-sitomo flex items-center justify-center text-sky-deep shrink-0 mt-0.5 border border-sky/20">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-blue-ink">
                      Official Institution Matching
                    </h4>
                    <p className="text-xs text-gray-body mt-0.5">
                      Direct, unmediated links to authentic .edu.kh and ministry portals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-sitomo flex items-center justify-center text-sky-deep shrink-0 mt-0.5 border border-sky/20">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-blue-ink">
                      Audited Live Deadlines
                    </h4>
                    <p className="text-xs text-gray-body mt-0.5">
                      Clear audit timestamps ensure you never apply to closed programs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-momo flex items-center justify-center text-blue-ink shrink-0 mt-0.5 border border-momo">
                    <ShieldAlert className="w-4 h-4 text-sky-deep" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-blue-ink">
                      Scam & Discrepancy Alerts
                    </h4>
                    <p className="text-xs text-gray-body mt-0.5">
                      Immediate warnings on suspicious upfront fee requests or fake flyers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Single Primary Action Button */}
              <div>
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 rounded-full bg-sky-deep px-7 py-3.5 text-sm font-bold text-white hover:bg-sky-dark transition-all bubble-shadow hover:-translate-y-0.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Link Verifier Tool</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Card Column - Clean Interactive Showcase Card */}
            <div className="lg:col-span-6">
              <InformationCheckDemo />
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

      {/* ── Interactive CTA Launchpad ───────────────────────── */}
      <InteractiveCTA />

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
