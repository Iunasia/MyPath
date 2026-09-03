"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  X,
  ArrowLeft,
  Laptop,
  FlaskConical,
  Briefcase,
  Palette,
  GraduationCap,
  HeartPulse,
  Binary,
  Leaf,
  Brain,
  BarChart3,
  Sparkles,
  Stethoscope,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────── */

interface MajorItem {
  id: string;
  name: string;
  category: string;
  badge?: {
    text: string;
    bg: string;
    textColor: string;
  };
  icon: typeof Binary;
  iconBg: string;
  iconColor: string;
  description: string;
  tags: string[];
  duration: string;
  degreeType: string;
  relatedCareers: string[];
  source: string;
  sourceUrl: string;
  lastVerified: string;
}

/* ── Categories & Majors Data ──────────────────────────── */

const CATEGORIES = [
  {
    id: "Computer Science",
    name: "Computer Science",
    icon: Laptop,
    bg: "bg-sitomo",
    iconColor: "text-sky-deep",
  },
  {
    id: "Science",
    name: "Science",
    icon: FlaskConical,
    bg: "bg-momo",
    iconColor: "text-[#D97736]",
  },
  {
    id: "Business",
    name: "Business",
    icon: Briefcase,
    bg: "bg-sitomo",
    iconColor: "text-blue-ink",
  },
  {
    id: "Art & Design",
    name: "Art & Design",
    icon: Palette,
    bg: "bg-momo",
    iconColor: "text-[#8B5CF6]",
  },
  {
    id: "Education",
    name: "Education",
    icon: GraduationCap,
    bg: "bg-sitomo",
    iconColor: "text-[#10B981]",
  },
  {
    id: "Healthcare",
    name: "Healthcare",
    icon: HeartPulse,
    bg: "bg-momo",
    iconColor: "text-[#EF4444]",
  },
];

const MAJORS_DATA: MajorItem[] = [
  {
    id: "data-science",
    name: "Data Science",
    category: "Computer Science",
    badge: {
      text: "High Demand",
      bg: "bg-[#FCEAE6]",
      textColor: "text-[#D96B54]",
    },
    icon: Binary,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description:
      "Extract insights from complex data sets to inform strategic business decisions. Blends statistics, computer science, and domain expertise.",
    tags: ["Python", "Machine Learning", "Statistics"],
    duration: "4 Years",
    degreeType: "Bachelor of Science",
    relatedCareers: ["Data Scientist", "Machine Learning Engineer", "BI Analyst"],
    source: "ACM / IEEE Computing Curricula & BLS",
    sourceUrl: "https://www.acm.org",
    lastVerified: "28 August 2026",
  },
  {
    id: "environmental-engineering",
    name: "Environmental Engineering",
    category: "Science",
    icon: Leaf,
    iconBg: "bg-[#FDF0E9]",
    iconColor: "text-[#E07A5F]",
    description:
      "Develop solutions to environmental problems, including water and air pollution control, recycling, and waste disposal.",
    tags: ["Sustainability", "Fluid Mechanics", "Ecology"],
    duration: "4 Years",
    degreeType: "Bachelor of Engineering",
    relatedCareers: ["Environmental Engineer", "Sustainability Consultant", "Water Resources Manager"],
    source: "ABET Engineering Accreditation & EPA",
    sourceUrl: "https://www.abet.org",
    lastVerified: "20 August 2026",
  },
  {
    id: "cognitive-science",
    name: "Cognitive Science",
    category: "Science",
    badge: {
      text: "Growing",
      bg: "bg-[#FDF0E6]",
      textColor: "text-[#CF7A42]",
    },
    icon: Brain,
    iconBg: "bg-sitomo",
    iconColor: "text-[#4F868A]",
    description:
      "Interdisciplinary study of the mind and its processes, drawing from psychology, linguistics, philosophy, and neuroscience.",
    tags: ["Research", "Analytical Thinking", "Neuroscience"],
    duration: "4 Years",
    degreeType: "Bachelor of Science",
    relatedCareers: ["Cognitive Researcher", "UX Researcher", "AI Ethics Analyst"],
    source: "Cognitive Science Society",
    sourceUrl: "https://cognitivesciencesociety.org",
    lastVerified: "15 August 2026",
  },
  {
    id: "business-analytics",
    name: "Business Analytics",
    category: "Business",
    badge: {
      text: "High Demand",
      bg: "bg-[#FCEAE6]",
      textColor: "text-[#D96B54]",
    },
    icon: BarChart3,
    iconBg: "bg-sitomo",
    iconColor: "text-blue-ink",
    description:
      "Bridge business strategy and technology using data-driven forecasting, operations modeling, and commercial decision frameworks.",
    tags: ["Financial Modeling", "SQL", "Strategy"],
    duration: "3-4 Years",
    degreeType: "Bachelor of Business Administration",
    relatedCareers: ["Management Consultant", "Financial Analyst", "Operations Analyst"],
    source: "AACSB Business Accreditation Standards",
    sourceUrl: "https://www.aacsb.edu",
    lastVerified: "18 August 2026",
  },
  {
    id: "digital-design",
    name: "UI/UX & Interactive Design",
    category: "Art & Design",
    badge: {
      text: "Popular",
      bg: "bg-[#F3EEFE]",
      textColor: "text-[#7C3AED]",
    },
    icon: Sparkles,
    iconBg: "bg-momo",
    iconColor: "text-[#8B5CF6]",
    description:
      "Design intuitive digital interfaces, accessible user flows, and interactive experiences across web, mobile, and emerging hardware platforms.",
    tags: ["Design Systems", "Prototyping", "User Research"],
    duration: "4 Years",
    degreeType: "Bachelor of Fine Arts",
    relatedCareers: ["Product Designer", "UI/UX Designer", "Design Systems Lead"],
    source: "AIGA Design Standards & Nielsen Norman Group",
    sourceUrl: "https://www.nngroup.com",
    lastVerified: "24 August 2026",
  },
  {
    id: "biomedical-sciences",
    name: "Biomedical Sciences",
    category: "Healthcare",
    badge: {
      text: "High Growth",
      bg: "bg-[#EBF7F2]",
      textColor: "text-[#059669]",
    },
    icon: Stethoscope,
    iconBg: "bg-momo",
    iconColor: "text-[#EF4444]",
    description:
      "Investigate cellular and biochemical pathways to develop therapies, advanced diagnostics, and groundbreaking medical technologies.",
    tags: ["Clinical Trials", "Genetics", "Biochemistry"],
    duration: "4 Years",
    degreeType: "Bachelor of Science",
    relatedCareers: ["Biomedical Researcher", "Clinical Trial Manager", "Genetic Counselor"],
    source: "NIH & Biomedical Science Institute Standards",
    sourceUrl: "https://www.nih.gov",
    lastVerified: "22 August 2026",
  },
];

/* ── Page Component ────────────────────────────────────── */

export default function MajorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<MajorItem | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Filter logic
  const filteredMajors = useMemo(() => {
    return MAJORS_DATA.filter((major) => {
      const matchesCategory = selectedCategory
        ? major.category === selectedCategory
        : true;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === ""
          ? true
          : major.name.toLowerCase().includes(q) ||
            major.description.toLowerCase().includes(q) ||
            major.category.toLowerCase().includes(q) ||
            major.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-powder text-blue-ink">
      {/* Responsive Viewport Container: Mobile by default, exact 80px margins on desktop */}
      <div className="w-full min-h-screen px-5 py-6 sm:px-10 lg:px-[80px] flex flex-col">
        
        {/* ── Top App Bar ──────────────────────────────────── */}
        <header className="flex items-center justify-between py-2 mb-8 border-b border-sky/15 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-display text-xl sm:text-2xl font-extrabold text-sky tracking-tight hover:opacity-85 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5 text-sky-deep" />
              <span>DOMNER</span>
            </Link>

          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-soft">
            <Link href="/" className="hover:text-blue-ink transition-colors">
              Home
            </Link>
            <Link href="/majors" className="text-sky-deep font-bold">
              Majors
            </Link>
            <Link href="/#careers" className="hover:text-blue-ink transition-colors">
              Careers
            </Link>
            <Link href="/#universities" className="hover:text-blue-ink transition-colors">
              Universities
            </Link>
            <Link href="/#scholarships" className="hover:text-blue-ink transition-colors">
              Scholarships
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-blue-ink hover:bg-sitomo/80 transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* ── Mobile Dropdown Menu ───────────────────────────── */}
        {menuOpen && (
          <nav className="md:hidden bg-white rounded-2xl p-4 mb-6 bubble-shadow-sm border border-sky/15 animate-fadeIn">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-soft mb-2 px-2">
              Navigation
            </p>
            <div className="flex flex-col gap-1 text-sm font-semibold">
              <Link
                href="/"
                className="px-3 py-2 rounded-xl text-blue-ink hover:bg-powder transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link
                href="/majors"
                className="px-3 py-2 rounded-xl bg-sky/15 text-sky-deep font-bold"
                onClick={() => setMenuOpen(false)}
              >
                📚 Major Explorer
              </Link>
              <Link
                href="/#careers"
                className="px-3 py-2 rounded-xl text-blue-ink hover:bg-powder transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                🧭 Career Explorer
              </Link>
              <Link
                href="/#universities"
                className="px-3 py-2 rounded-xl text-blue-ink hover:bg-powder transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                🎓 Universities
              </Link>
              <Link
                href="/#scholarships"
                className="px-3 py-2 rounded-xl text-blue-ink hover:bg-powder transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                💰 Scholarships
              </Link>
            </div>
          </nav>
        )}

        {/* ── Hero Heading & Search ────────────────────────── */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                Discover Your
                <br />
                Major &amp; Career
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-soft mt-3 leading-relaxed font-medium">
                Explore thousands of majors and careers pathways, find the perfect fit
                for your passions, skills, and future goals.
              </p>
            </div>

            {/* Search Bar: Compact on desktop, full width on mobile */}
            <div className="w-full lg:max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-soft" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for major, career, or skill..."
                  className="w-full pl-11 pr-10 py-3.5 bg-white rounded-2xl border border-sky/20 text-sm text-blue-ink placeholder:text-gray-faint focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-all bubble-shadow-sm font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-soft hover:text-blue-ink cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Browse by Interest (1 Row on Desktop, 3 Cols on Mobile) ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base sm:text-lg font-bold text-blue-ink tracking-tight">
              Browse by interest
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-sky-deep hover:underline cursor-pointer"
              >
                Reset filter
              </button>
            )}
          </div>

          {/* Stays in one row on desktop (md:grid-cols-6) and 3 columns on mobile */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : cat.id)
                  }
                  className={`flex flex-col items-center justify-center p-3.5 sm:p-4 lg:p-5 rounded-2xl bg-white border transition-all text-center group cursor-pointer ${
                    isSelected
                      ? "border-sky ring-2 ring-sky/30 bg-sky/5 bubble-shadow"
                      : "border-sky/15 hover:border-sky/30 bubble-shadow-sm hover:scale-[1.02]"
                  }`}
                >
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${cat.bg} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${cat.iconColor}`} strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-blue-ink leading-tight">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Trending Majors (Bigger Multi-Column Cards on Desktop) ── */}
        <section className="flex-1 pb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink tracking-tight">
              {selectedCategory ? `${selectedCategory} Majors` : "Trending Majors"}
            </h2>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery("");
              }}
              className="text-xs sm:text-sm font-bold text-sky-deep hover:text-sky transition-colors flex items-center gap-1 cursor-pointer"
            >
              View All <span>→</span>
            </button>
          </div>

          {filteredMajors.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-sky/15 bubble-shadow-sm mt-4 max-w-lg mx-auto">
              <p className="font-bold text-blue-ink text-base">No majors found</p>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5">
                Try searching for a different skill or reset your category filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery("");
                }}
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky text-white text-xs sm:text-sm font-bold hover:bg-sky-bright transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* Responsive Grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {filteredMajors.map((major) => {
                const Icon = major.icon;

                return (
                  <article
                    key={major.id}
                    className="bg-white rounded-3xl p-6 lg:p-7 border border-sky/15 bubble-shadow-sm hover:border-sky/35 bubble-shadow-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Icon + Optional Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-2xl ${major.iconBg} flex items-center justify-center`}
                        >
                          <Icon className={`w-6 h-6 ${major.iconColor}`} strokeWidth={2.2} />
                        </div>

                        {major.badge && (
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${major.badge.bg} ${major.badge.textColor}`}
                          >
                            {major.badge.text}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-display text-lg lg:text-xl font-bold text-blue-ink mb-2">
                        {major.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-body leading-relaxed mb-4 font-medium">
                        {major.description}
                      </p>
                    </div>

                    <div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {major.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-sitomo/70 text-blue-ink text-xs font-semibold px-3 py-1 rounded-full border border-sky/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => setSelectedMajor(major)}
                        className="w-full rounded-full border-2 border-sky/50 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-sky-deep hover:bg-sky/10 hover:border-sky transition-colors text-center cursor-pointer"
                      >
                        Explore Major
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Detail & Verification Modal ──────────────────── */}
        {selectedMajor && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
            <div
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-6 bubble-shadow border border-sky/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl ${selectedMajor.iconBg} flex items-center justify-center`}
                  >
                    <selectedMajor.icon
                      className={`w-6 h-6 ${selectedMajor.iconColor}`}
                      strokeWidth={2.2}
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-extrabold text-blue-ink">
                      {selectedMajor.name}
                    </h3>
                    <p className="text-xs text-gray-soft font-semibold">
                      {selectedMajor.degreeType} · {selectedMajor.duration}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMajor(null)}
                  className="p-1.5 rounded-full hover:bg-powder text-gray-soft hover:text-blue-ink transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-body leading-relaxed mb-5 font-medium">
                {selectedMajor.description}
              </p>

              {/* Related Pathways */}
              <div className="rounded-2xl bg-powder p-4 border border-sky/15 mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-ink mb-2">
                  Related Career Pathways
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMajor.relatedCareers.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-ink border border-sky/15"
                    >
                      <Check className="w-3 h-3 text-sky-deep" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* DMIL Verification Card */}
              <div className="rounded-2xl bg-momo p-4 border border-momo mb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-deep" />
                    <span className="text-xs font-bold text-blue-ink uppercase tracking-wider">
                      Information Check
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky/20 px-2.5 py-0.5 text-[10px] font-bold text-sky-deep">
                    Verified Source
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-blue-ink mt-2 font-medium">
                  <div>
                    <span className="text-[11px] text-gray-soft block">Curriculum Source:</span>
                    <span className="font-bold">{selectedMajor.source}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-soft block">Last Checked:</span>
                    <span className="font-bold">{selectedMajor.lastVerified}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5">
                <a
                  href={selectedMajor.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-sky py-3 text-xs sm:text-sm font-bold text-white hover:bg-sky-bright transition-colors bubble-shadow-sm"
                >
                  Official Curricula
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setSelectedMajor(null)}
                  className="px-5 py-3 rounded-full border-2 border-sky/20 text-xs sm:text-sm font-bold text-gray-soft hover:bg-powder transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

