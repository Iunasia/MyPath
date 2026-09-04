import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
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
  { label: "Scholarships", href: "#scholarships" },
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
  { icon: Briefcase, title: "Career Explorer", description: "Explore careers based on your interests, skills, and values. See real pathways people take.", chip: "bg-sitomo text-sky-deep", border: "border-sky/20", href: "/careers" },
  { icon: BookOpen, title: "Major Explorer", description: "Discover majors and see how they connect to careers, industries, and further study.", chip: "bg-momo text-blue-ink", border: "border-momo", href: "/majors" },
  { icon: GraduationCap, title: "University Explorer", description: "Search and compare universities by program, location, cost, and student outcomes.", chip: "bg-sitomo text-blue-ink", border: "border-sitomo", href: "/universities" },
  { icon: CircleDollarSign, title: "Scholarship Explorer", description: "Find scholarships and funding opportunities you're actually eligible for.", chip: "bg-momo text-blue-ink", border: "border-momo", href: "#scholarships" },
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

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-powder pt-28 pb-8">
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 pt-12 pb-20 lg:pt-16 lg:pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <span className="sticker mb-6">
              <span className="sticker-dot" aria-hidden="true" />
              Digital Information Literacy
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-blue-ink leading-[1.15] tracking-tight mt-5">
              Figure out your future,
              <br />
              <span className="text-sky-deep">one check at a time.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-body leading-relaxed max-w-xl mx-auto font-medium">
              Domner helps you evaluate, verify, and compare the information
              you find about careers, universities, and scholarships — so you
              can actually trust what you decide.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#start" className="inline-flex items-center gap-1.5 rounded-full bg-sky px-7 py-3 text-sm font-bold text-white hover:bg-sky-bright transition-colors bubble-shadow">
                Start exploring
                <span aria-hidden="true">→</span>
              </a>
              <a href="#how-it-works" className="inline-flex items-center gap-1.5 rounded-full border-2 border-sky/25 bg-white px-7 py-3 text-sm font-bold text-blue-ink hover:bg-sky/10 transition-colors">
                See how it works
              </a>
            </div>

            {/* Quick stats as pastel chips */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
              {[
                { label: "7-Step Process", chip: "bg-sitomo text-sky-deep" },
                { label: "Source Verified", chip: "bg-momo text-blue-ink" },
                { label: "Always Free", chip: "bg-sitomo text-blue-ink" },
              ].map((s) => (
                <span key={s.label} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold ${s.chip}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" aria-hidden="true" />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <WaveBottom fill="#FFFFFF" />
      </section>

      {/* ── DMIL Bubble Path ─────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="sticker mb-4">
              <span className="sticker-dot" aria-hidden="true" />
              The DMIL difference
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-blue-ink tracking-tight mt-4">
              Not just finding information.
              <br />
              <span className="text-gray-faint">Understanding it.</span>
            </h2>
          </div>

          {/* Bubble path — desktop: horizontal, mobile: vertical */}
          <div className="relative">
            {/* Desktop connector line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-sky/20 -translate-y-1/2 rounded-full" style={{ left: "4%", right: "4%" }} />

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-0">
              {DMIL_STEPS.map((step, i) => (
                <div key={step.title} className={`flex flex-col items-center text-center lg:flex-1 ${i === 3 ? "relative z-10" : ""}`}>
                  {/* Bubble */}
                  <div className={`relative flex items-center justify-center w-16 h-16 lg:w-[4.5rem] lg:h-[4.5rem] rounded-full ${step.bg} ${i === 3 ? "ring-4 ring-sky/35 bubble-shadow" : ""}`}>
                    <step.icon className={`w-7 h-7 lg:w-8 lg:h-8 ${step.color}`} strokeWidth={2.2} aria-hidden="true" />
                    {i === 3 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-sky flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
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

      {/* ── Four Explorers ───────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-powder">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="sticker mb-4">
              <span className="sticker-dot" aria-hidden="true" />
              Explore with purpose
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-blue-ink tracking-tight mt-4">
              Four ways to discover your path
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 lg:gap-6">
            {EXPLORERS.map((e) => (
              <Link
                key={e.title}
                href={e.href}
                className="group flex items-center gap-5 sm:gap-6 rounded-4xl border-2 border-sky/40 bg-white py-5 px-6 sm:py-6 sm:px-8 bubble-shadow-sm hover:border-sky cursor-pointer"
              >
                <span className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full ${e.chip} shrink-0 border-2 border-sky/15`}>
                  <e.icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg sm:text-xl font-extrabold text-blue-ink group-hover:text-sky-deep truncate">
                    {e.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-body leading-relaxed line-clamp-2 mt-1 font-medium">
                    {e.description}
                  </p>
                </div>
                <span className="text-sky/60 group-hover:text-sky-deep text-xl sm:text-2xl shrink-0 font-bold" aria-hidden="true">
                  →
                </span>
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
            <a href="#" className="inline-flex items-center gap-1.5 rounded-full bg-sky px-8 py-3.5 text-sm font-bold text-white hover:bg-sky-bright transition-colors bubble-shadow">
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
