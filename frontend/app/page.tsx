import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSlider from "./components/HeroSlider";
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
  { icon: ShieldCheck, title: "Verify", bg: "bg-sky/25", color: "text-blue-ink" },
  { icon: ArrowLeftRight, title: "Compare", bg: "bg-sitomo", color: "text-sky-deep" },
  { icon: FolderTree, title: "Organize", bg: "bg-momo", color: "text-blue-ink" },
  { icon: CheckCircle2, title: "Decide", bg: "bg-sitomo", color: "text-blue-ink" },
];

const DMIL_DESCRIPTIONS = [
  "Explore careers, majors, and opportunities that match your interests.",
  "Find universities, scholarships, and programs from multiple sources.",
  "Assess source credibility, check for conflicts, and judge relevance.",
  "Confirm information against official sources and check freshness.",
  "Place opportunities side by side to see real differences.",
  "Save, categorize, and track deadlines for your shortlisted options.",
  "Make a confident, evidence-based decision about your future.",
];

const EXPLORERS = [
  {
    icon: Briefcase,
    title: "Career Explorer",
    description: "Explore careers based on your interests, skills, and values. See real pathways people take.",
    chip: "bg-sitomo text-sky-deep",
    href: "/careers",
  },
  {
    icon: BookOpen,
    title: "Major Explorer",
    description: "Discover majors and see how they connect to careers, industries, and further study.",
    chip: "bg-momo text-blue-ink",
    href: "/majors",
  },
  {
    icon: GraduationCap,
    title: "University Explorer",
    description: "Search and compare universities by program, location, cost, and student outcomes.",
    chip: "bg-sitomo text-blue-ink",
    href: "/universities",
  },
  {
    icon: CircleDollarSign,
    title: "Scholarship Explorer",
    description: "Find scholarships and funding opportunities you're actually eligible for.",
    chip: "bg-momo text-blue-ink",
    href: "/scholarships",
  },
];

const TRUST_ITEMS = [
  { icon: RotateCw, title: "7-Step Process", description: "A structured journey from discovery to informed decision.", bg: "bg-sitomo" },
  { icon: Link2, title: "Source Verified", description: "Every claim links back to its original, official source.", bg: "bg-momo" },
  { icon: Zap, title: "Real-Time Checking", description: "Information freshness is always visible and up to date.", bg: "bg-sitomo" },
  { icon: Sparkles, title: "Always Free", description: "Full access for every student. No paywalls, no hidden costs.", bg: "bg-momo" },
];

/* ── Page ──────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Reusable Floating Navbar Component ────────── */}
      <Header variant="home" />

      {/* ── Hero Slider (EduBlock Style with Left Slide Animation) ── */}
      <HeroSlider />

      {/* ── DMIL Step Flow (Numbered Steps with Dashed Line, No Icons) ── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Centered Heading matching screenshot style */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-blue-ink tracking-tight">
              Not just finding information.
              <br />
              <span className="text-sky-deep">Understanding it.</span>
            </h2>
          </div>

          {/* ── Desktop View: Horizontal 7-Step Row with Curled Dashed Connector ── */}
          <div className="hidden lg:block relative pt-2">
            {/* Desktop Curled Dashed Connector Wave */}
            <div
              className="absolute top-1 left-0 right-0 h-16 pointer-events-none z-0"
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
                  i % 2 === 1 ? "-translate-y-1.5" : "translate-y-0.5";

                return (
                  <div
                    key={`desktop-${step.title}`}
                    className={`group flex flex-col items-center text-center flex-1 relative z-10 transition-transform ${offsetClass}`}
                  >
                    {/* Step Number Circle (No Icon, Just Step Number) */}
                    <div className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-sky/30 shadow-md shadow-slate-200/60 group-hover:border-sky-deep group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      <span className="font-display font-extrabold text-lg sm:text-xl text-blue-ink group-hover:text-sky-deep transition-colors">
                        {i + 1}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="font-display text-sm sm:text-base font-bold text-blue-ink mt-4 mb-1.5 group-hover:text-sky-deep transition-colors">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-xs text-gray-body leading-relaxed max-w-[135px] mx-auto font-normal">
                      {DMIL_DESCRIPTIONS[i]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Mobile View: Gently Curved V-Shape Zigzag (Matching Hand-Drawn Sketch) ── */}
          <div className="lg:hidden relative w-[320px] mx-auto h-[950px] pt-1">
            {/* SVG Dashed Connecting Lines (Gently Curved V-Shape Zigzag) */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 320 950"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d="M 72 28
                     C 148 51, 237 117, 248 163
                     C 237 209, 148 275, 72 298
                     C 148 321, 237 387, 248 433
                     C 237 479, 148 545, 72 568
                     C 148 591, 237 657, 248 703
                     C 237 749, 148 815, 72 838"
                  stroke="#7AB3B7"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* 7 Alternating Steps (Positioned along the V-shape / Zigzag Path) */}
            {DMIL_STEPS.map((step, i) => {
              const isLeft = i % 2 === 0;

              return (
                <div
                  key={`mobile-${step.title}`}
                  style={{ top: `${i * 135}px` }}
                  className={`absolute ${
                    isLeft ? "left-1" : "right-1"
                  } w-[136px] flex flex-col items-center text-center z-10 group`}
                >
                  {/* Step Number Circle (No Icon, Just Step Number) */}
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
                  <p className="text-[11px] text-gray-body leading-relaxed font-normal bg-white/80 rounded px-1">
                    {DMIL_DESCRIPTIONS[i]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <WaveTop fill="#E2F1F1" />

      {/* ── Four Explorers (Matching Reference Image Style) ── */}
      <section className="py-20 lg:py-28 bg-powder">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-blue-ink tracking-tight">
              Four ways to discover your path
            </h2>
            <p className="text-sm sm:text-base text-gray-body mt-3 font-medium">
              Explore verified pathways and resources to guide your education and career journey.
            </p>
          </div>

          {/* ── Mobile View: Original Horizontal Card Style ── */}
          <div className="flex flex-col gap-4 sm:hidden">
            {EXPLORERS.map((e) => (
              <Link
                key={`mobile-${e.title}`}
                href={e.href}
                className="group flex items-center gap-4 rounded-3xl bg-white p-4.5 border border-sky/20 hover:border-sky hover:shadow-lg hover:shadow-slate-300/40 transition-all duration-200 cursor-pointer"
              >
                <div
                  className={`w-13 h-13 rounded-full ${e.chip} border-2 border-sky/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
                >
                  <e.icon className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-extrabold text-blue-ink group-hover:text-sky-deep transition-colors truncate">
                    {e.title}
                  </h3>
                  <p className="text-xs text-gray-body leading-relaxed line-clamp-2 mt-0.5 font-medium">
                    {e.description}
                  </p>
                </div>
                <span
                  className="text-sky/60 group-hover:text-sky-deep text-xl shrink-0 font-bold transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            ))}
          </div>

          {/* ── Tablet & Desktop View: Reference Image Style ── */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXPLORERS.map((e) => (
              <Link
                key={e.title}
                href={e.href}
                className="group flex flex-col items-center text-center rounded-[28px] bg-white p-7 sm:p-8 border border-sky/20 hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
              >
                {/* Circular Icon Badge (Original Brand Chips: sitomo & momo) */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${e.chip} border-2 border-sky/15 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 shrink-0`}
                >
                  <e.icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} aria-hidden="true" />
                </div>

                {/* Title */}
                <h3 className="font-display text-sm sm:text-base font-extrabold text-blue-ink uppercase tracking-wider group-hover:text-sky-deep transition-colors mb-2.5">
                  {e.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-normal">
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
                <a href="#" className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-sky px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-bright transition-colors bubble-shadow-sm">
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
            <a href="#start" className="group inline-flex items-center gap-1.5 rounded-full bg-sky px-8 py-3.5 text-sm font-bold text-white hover:bg-sky-bright transition-colors bubble-shadow">
              <span>Start exploring for free</span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
