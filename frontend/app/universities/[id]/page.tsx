import { notFound } from "next/navigation";
import {
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Globe,
  Briefcase,
  Database,
  Heart,
  Building2,
  ShieldCheck,
  Phone,
  Banknote,
  GraduationCap,
  Award,
  BookOpen,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SaveItemButton from "@/app/components/SaveItemButton";
import {
  UNIVERSITIES_DATA,
  getUniversityById,
} from "@/app/data/universities";

/* ── Static Generation for All Universities ──────────────── */

export function generateStaticParams() {
  return UNIVERSITIES_DATA.map((uni) => ({
    id: uni.id,
  }));
}

/* ── Icon Selector Helper ────────────────────────────────── */

function getProgramIcon(iconName: string) {
  switch (iconName) {
    case "laptop":
      return Laptop;
    case "globe":
      return Globe;
    case "briefcase":
      return Briefcase;
    case "database":
      return Database;
    case "heart":
      return Heart;
    case "shield":
      return ShieldCheck;
    default:
      return Building2;
  }
}

/* ── University Detail Page ──────────────────────────────── */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UniversityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const university = getUniversityById(id);

  if (!university) {
    notFound();
  }

  // Calculate total majors across all faculties
  const totalMajorsCount =
    university.facultiesList?.reduce(
      (acc, fac) => acc + fac.majors.length,
      0
    ) || university.popularMajors.length;

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      {/* Full-width responsive container */}
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        {/* ── Top Header Component ────────────────────────── */}
        <Header
          backHref="/universities"
          backLabel="Back to Universities"
          showBackArrow={true}
          activeNav="universities"
        />

        {/* ── Main Content Container ────────────────────────── */}
        <main className="w-full pb-16 flex flex-col gap-10 mt-4">
          {/* 1. Hero Campus Image Banner */}
          <section className="w-full">
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[420px] rounded-3xl overflow-hidden mb-6 border border-sky/20 bubble-shadow-sm bg-sitomo/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={university.heroImage || university.image}
                alt={university.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

              {/* Floating Save Button on Image Banner */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
                <SaveItemButton
                  item={{
                    id: university.id,
                    type: "university",
                    title: university.name,
                    subtitle: university.location,
                    image: university.heroImage || university.image,
                    badge: university.type,
                    link: `/universities/${university.id}`,
                  }}
                  variant="pill"
                />
              </div>

              {/* Bottom Badges on Hero Banner */}
              <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-2 text-white text-xs sm:text-sm font-bold">
                <div className="flex items-center gap-2">
                  <span className="bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
                    {university.type} University
                  </span>
                  {university.established && (
                    <span className="bg-black/50 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/20 text-white/90">
                      Est. {university.established}
                    </span>
                  )}
                </div>
                <span className="bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sitomo" />
                  <span>{university.location}</span>
                </span>
              </div>
            </div>

            {/* University Title & Description */}
            <div className="max-w-4xl">

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                {university.taglinePrefix}{" "}
                <span className="text-sky-deep">
                  {university.taglineHighlight}
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-body leading-relaxed font-medium mt-3">
                {university.description}
              </p>

              {/* ── Quick Contact & Links Bar ────────────────── */}
              <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-sky/15">
                {university.phone && (
                  <a
                    href={`tel:${university.phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-sky/25 text-xs font-bold text-blue-ink hover:border-sky hover:text-sky-deep bubble-shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-sky-deep" />
                    <span>{university.phone}</span>
                  </a>
                )}

                {university.website && (
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-sky/25 text-xs font-bold text-blue-ink hover:border-sky hover:text-sky-deep bubble-shadow-sm transition-all"
                  >
                    <Globe className="w-3.5 h-3.5 text-sky-deep" />
                    <span>Official Website</span>
                    <ExternalLink className="w-3 h-3 text-gray-soft" />
                  </a>
                )}

                {university.mapUrl && (
                  <a
                    href={university.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sitomo/60 border border-sky/20 text-xs font-bold text-blue-ink hover:bg-sitomo bubble-shadow-sm transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5 text-sky-deep" />
                    <span>Google Maps Directions</span>
                    <ExternalLink className="w-3 h-3 text-sky-deep" />
                  </a>
                )}

                {university.tuitionFee && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky/10 border border-sky/20 text-xs font-bold text-sky-deep">
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Tuition: {university.tuitionFee}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 2. Tuition Fee Section */}
          {university.tuitionFee && (
            <section>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky/15 flex items-center justify-center text-sky-deep">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                      Tuition & Fees
                    </h2>
                    <p className="text-xs text-gray-soft font-medium">
                      Official published tuition rates and program costs
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky/20 bubble-shadow-sm max-w-4xl">
                {/* Summary Rate Banner */}
                <div className="bg-sitomo/50 rounded-2xl p-5 border border-sky/20 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-soft block">
                      Standard Tuition Fee
                    </span>
                    <span className="font-display text-lg sm:text-xl font-extrabold text-blue-ink mt-0.5 block">
                      {university.tuitionFee}
                    </span>
                  </div>
                  <span className="text-xs text-sky-deep font-bold bg-white px-3.5 py-1.5 rounded-full border border-sky/20 w-fit">
                    Verified Academic Rates
                  </span>
                </div>

                {/* Detailed Breakdown List */}
                {university.tuitionDetails && university.tuitionDetails.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-soft mb-3">
                      Fee Breakdown by Program / Faculty
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {university.tuitionDetails.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-powder border border-sky/15 hover:border-sky/40 transition-colors"
                        >
                          <span className="text-xs font-semibold text-blue-ink pr-3">
                            {item.facultyOrCategory}
                          </span>
                          <span className="text-xs font-extrabold text-sky-deep shrink-0 bg-white px-2.5 py-1 rounded-lg border border-sky/15">
                            {item.fee}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 3. Comprehensive Faculties & Degree Majors Directory */}
          {university.facultiesList && university.facultiesList.length > 0 && (
            <section>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky/15 flex items-center justify-center text-sky-deep">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                        Faculties & Degree Majors
                      </h2>
                      <p className="text-xs text-gray-soft font-medium">
                        Explore all departments and specialized academic pathways
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-sky-deep bg-white px-3.5 py-1.5 rounded-full border border-sky/20 w-fit">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    {totalMajorsCount} Majors across {university.facultiesList.length} Faculties
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {university.facultiesList.map((faculty, fIdx) => (
                  <div
                    key={fIdx}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-sky/20 bubble-shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-sky/15">
                        <h3 className="font-display text-sm sm:text-base font-bold text-blue-ink">
                          {faculty.facultyName}
                        </h3>
                        <span className="text-[10px] font-extrabold text-sky-deep bg-powder px-2 py-0.5 rounded-full border border-sky/20 shrink-0">
                          {faculty.majors.length} {faculty.majors.length === 1 ? "Major" : "Majors"}
                        </span>
                      </div>

                      {/* List of Majors Chips */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {faculty.majors.map((major, mIdx) => (
                          <span
                            key={mIdx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sitomo/40 border border-sky/20 text-xs font-semibold text-blue-ink hover:bg-sitomo transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-sky shrink-0" />
                            <span>{major}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. Degree Levels: Undergraduate & Graduate */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Undergraduate Degree */}
            <div className="flex flex-col">
              <div className="relative w-full h-56 sm:h-64 lg:h-72 rounded-2xl overflow-hidden mb-3.5 border border-sky/15 bubble-shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={university.undergraduate.image}
                  alt={university.undergraduate.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="border-l-4 border-sky pl-3.5 py-1">
                <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink">
                  {university.undergraduate.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium mt-1">
                  {university.undergraduate.description}
                </p>
              </div>
            </div>

            {/* Graduate Degree */}
            <div className="flex flex-col">
              <div className="relative w-full h-56 sm:h-64 lg:h-72 rounded-2xl overflow-hidden mb-3.5 border border-sky/15 bubble-shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={university.graduate.image}
                  alt={university.graduate.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="border-l-4 border-sky pl-3.5 py-1">
                <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink">
                  {university.graduate.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium mt-1">
                  {university.graduate.description}
                </p>
              </div>
            </div>
          </section>

          {/* 5. Academic Programs Highlights */}
          <section>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-6">
              Program Highlights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {university.programs.map((program) => {
                const Icon = getProgramIcon(program.iconName);
                return (
                  <div
                    key={program.title}
                    className="rounded-3xl border-2 border-sky/35 bg-white/80 backdrop-blur-xs p-6 sm:p-7 text-center bubble-shadow-sm hover:border-sky transition-all flex flex-col items-center rounded-br-[56px]"
                  >
                    {/* Centered Circular Icon Badge */}
                    <div className="w-14 h-14 rounded-full bg-sitomo flex items-center justify-center mb-4 border border-sky/20 shadow-2xs">
                      <Icon className="w-6 h-6 text-blue-ink" strokeWidth={2.2} />
                    </div>

                    <h3 className="font-display text-base sm:text-lg font-bold text-blue-ink mb-2">
                      {program.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium">
                      {program.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 6. Admission Requirements & Deadline */}
          <section>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-6">
              Admission
            </h2>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky/15 bubble-shadow-sm max-w-3xl">
              {/* Checklist Requirements */}
              <div className="space-y-3.5 mb-6">
                {university.admissionRequirements.map((req) => (
                  <div key={req} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-sky-deep shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-blue-ink">
                      {req}
                    </span>
                  </div>
                ))}
              </div>

              {/* Application Deadline Box */}
              <div className="bg-sitomo/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-sky/20">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-soft block">
                    Application Deadline
                  </span>
                  <span className="font-display text-sm sm:text-base font-extrabold text-sky-deep mt-0.5 block">
                    {university.applicationDeadline}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-sky/20 shadow-2xs shrink-0">
                  <Calendar className="w-5 h-5 text-sky-deep" />
                </div>
              </div>
            </div>
          </section>

          {/* 7. Campus Facilities */}
          <section>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-6">
              Campus Facilities
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {university.facilities.map((fac) => (
                <div key={fac.name} className="flex flex-col group">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-sky/15 bubble-shadow-sm mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fac.image}
                      alt={fac.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-blue-ink leading-snug">
                    {fac.name}
                  </h3>
                </div>
              ))}
            </div>
          </section>

          {/* 8. Scholarship Opportunities */}
          <section>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-sky/15 flex items-center justify-center text-sky-deep">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                  Scholarships & Financial Aid
                </h2>
                <p className="text-xs text-gray-soft font-medium">
                  Opportunities to fund your university studies
                </p>
              </div>
            </div>

            {/* List all specific scholarships if available */}
            {university.scholarshipsList && university.scholarshipsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mb-6">
                {university.scholarshipsList.map((scholarshipName, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-sky/20 bubble-shadow-sm flex items-start gap-3.5 hover:border-sky transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sitomo/70 flex items-center justify-center text-blue-ink shrink-0 mt-0.5 border border-sky/20">
                      <Award className="w-5 h-5 text-sky-deep" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-blue-ink leading-snug">
                        {scholarshipName}
                      </h3>
                      <span className="inline-block mt-2 text-[10px] font-extrabold text-sky-deep bg-powder px-2.5 py-0.5 rounded-full border border-sky/20">
                        Official Scholarship Program
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback single scholarship banner */
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky/15 bubble-shadow-sm max-w-3xl flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden shrink-0 border border-sky/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={university.scholarship.image}
                    alt={university.scholarship.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-display text-base sm:text-lg font-bold text-blue-ink mb-2">
                    {university.scholarship.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-100 w-fit">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Deadline: {university.scholarship.deadline}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 9. Location & Campus Branches */}
          <section>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-6">
              Location & Campus Map
            </h2>

            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-sky/15 bubble-shadow-sm max-w-3xl">
              <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-sky/15 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={university.mapImage}
                  alt={`${university.name} Location Map`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-bold text-blue-ink flex items-center gap-1.5 shadow-sm border border-sky/15">
                  <MapPin className="w-3.5 h-3.5 text-sky-deep" />
                  <span>{university.location}</span>
                </div>
              </div>

              {/* Branch links if multiple branches exist */}
              {university.branches && university.branches.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-soft block">
                    Campus Branches
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {university.branches.map((branch, bIdx) => (
                      <a
                        key={bIdx}
                        href={branch.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-sky-deep hover:underline bg-sitomo/60 px-4 py-2.5 rounded-full border border-sky/20 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{branch.name} — Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  href={university.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-sky-deep hover:underline bg-sitomo/60 px-4 py-2.5 rounded-full border border-sky/20 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
