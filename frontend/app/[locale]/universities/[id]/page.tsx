import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/src/i18n";
import { type Locale } from "@/src/i18n/routing";
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
  Award,
  Phone,
} from "lucide-react";
import Footer from "@/app/components/Footer";
import BackLink from "@/app/components/BackLink";
import SaveItemButton from "@/app/components/SaveItemButton";
import ScholarshipCard from "@/app/components/ScholarshipCard";
import { getUniversitiesTranslated } from "@/app/data/universities";
import { SCHOLARSHIPS_DATA } from "@/app/data/scholarships";
import { getUniversity, getScholarships } from "@/app/lib/api.server";
import { toUniversityView } from "@/app/lib/catalogAdapters";
import {
  toScholarshipViews,
  curatedToScholarshipView,
  getScholarshipsForUniversity,
  type ScholarshipView,
} from "@/app/lib/adapters";

/** Rendered per request — dynamic route */
export const dynamic = "force-dynamic";

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
  const t = await getTranslations("universityDetail");
  const locale = (await getLocale()) as Locale;

  // The API decides which universities exist and supplies the core facts.
  const [row, apiScholarships] = await Promise.all([
    getUniversity(id),
    getScholarships(),
  ]);

  const view = row ? toUniversityView(row) : null;
  const translatedUniversities = await getUniversitiesTranslated(locale);
  const curated = translatedUniversities.find(
    (u) =>
      u.id.toLowerCase() === id.toLowerCase() ||
      (view && u.id.toLowerCase() === view.id.toLowerCase())
  );

  if (!view && !curated) {
    notFound();
  }

  const university = {
    ...curated,
    ...view,
    id: view?.id ?? curated?.id ?? id,
    popularMajors: view?.popularMajors ?? curated?.popularMajors ?? [],
    heroImage: curated?.heroImage || curated?.image || (view as any)?.bannerImage || "",
    image: curated?.image || (view as any)?.bannerImage || "",
    name: curated?.name ?? view?.name ?? "",
    shortName: curated?.shortName ?? view?.shortName ?? "",
    location: curated?.location ?? view?.location ?? "",
    type: view?.type ?? curated?.type ?? "University",
    tuitionFee: curated?.tuitionFee ?? view?.tuitionFee ?? null,
    description: curated?.description ?? view?.description ?? "",
  };

  // Check if current page is CADT
  const isCadt = university.id.toLowerCase() === "cadt";

  // Compile available scholarships from API and curated data
  const backendViews = toScholarshipViews(apiScholarships || []);
  const curatedViews = SCHOLARSHIPS_DATA.map(curatedToScholarshipView);
  const allScholarships: ScholarshipView[] = [...backendViews];
  for (const cv of curatedViews) {
    if (!allScholarships.some((s) => s.id === cv.id || s.title.toLowerCase() === cv.title.toLowerCase())) {
      allScholarships.push(cv);
    }
  }

  // Scholarships relating directly to this university
  const universityScholarships = getScholarshipsForUniversity(university, allScholarships);

  // Calculate total majors across all faculties
  const totalMajorsCount =
    university.facultiesList?.reduce(
      (acc, fac) => acc + fac.majors.length,
      0
    ) || (university.popularMajors ? university.popularMajors.length : 0);



  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      {/* Full-width responsive container */}
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        <BackLink href="/universities" label={t("allUniversities")} className="mb-6" />

        {/* ── Main Content Container ────────────────────────── */}
        <main className="w-full pb-16 flex flex-col gap-10">
          {/* 1. Hero Campus Image Banner & Title Below */}
          <section className="w-full">
            {/* Hero campus image banner */}
            <div className="group relative w-full h-64 sm:h-80 md:h-96 lg:h-[450px] xl:h-[500px] rounded-3xl overflow-hidden mb-6 border border-sky/20 bubble-shadow-sm bg-sitomo/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={university.heroImage || university.image}
                alt={university.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

              {/* Floating Save Button on Image Banner */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 flex flex-wrap justify-end gap-2">
                <SaveItemButton
                  item={{
                    id: university.id,
                    apiId: university.apiId,
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

              {/* Bottom Badges on Hero Banner - Shown on hover */}
              <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-2 text-white text-xs sm:text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2">
                  <span className="bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
                    {t("universityUniversity", { type: university.type })}
                  </span>
                  {university.established && (
                    <span className="bg-black/50 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/20 text-white/90">
                      {t("est")} {university.established}
                    </span>
                  )}
                </div>
                <span className="bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sitomo" />
                  <span>{university.location}</span>
                </span>
              </div>
            </div>

            {/* University Title & Description Below The Image */}
            <div className="max-w-4xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                {university.name}
              </h1>
              {university.taglinePrefix && university.taglineHighlight && (
                <p className="text-sm sm:text-base lg:text-lg font-bold text-sky-deep mt-2">
                  {university.taglinePrefix}{" "}
                  <span className="text-sky-deep">
                    {university.taglineHighlight}
                  </span>
                </p>
              )}
              <p className="text-sm sm:text-base lg:text-lg text-gray-body leading-relaxed font-medium mt-3">
                {university.description}
              </p>

              {/* Quick Contact & Links Bar */}
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
                    <span>{t("officialWebsite")}</span>
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
                    <span>{t("googleMapsDirections")}</span>
                    <ExternalLink className="w-3 h-3 text-sky-deep" />
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* 2. Key Statistics Bar */}
          <section className="w-full">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-sky/20 bubble-shadow-sm">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-x-6 lg:gap-0 lg:divide-x lg:divide-sky/15">
                {/* Stat 1: Established */}
                <div className="flex flex-col items-center text-center px-1 sm:px-4">
                  <div className="h-8 sm:h-9 lg:h-10 flex items-center justify-center">
                    <span className="font-display text-lg sm:text-xl lg:text-2xl font-extrabold text-blue-ink tracking-tight text-center">
                      {university.established ? `${t("est")} ${university.established}` : "Accredited"}
                    </span>
                  </div>
                  <div className="min-h-[1.75rem] sm:min-h-[2rem] flex items-center justify-center mt-1">
                    <span className="text-xs sm:text-sm font-bold text-sky-deep leading-snug text-center">
                      Foundation & Heritage
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-soft font-medium mt-0.5 leading-tight text-center">
                    Recognized institutional quality
                  </span>
                </div>

                {/* Stat 2: Student Community */}
                <div className="flex flex-col items-center text-center px-1 sm:px-4">
                  <div className="h-8 sm:h-9 lg:h-10 flex items-center justify-center">
                    <span className="font-display text-lg sm:text-xl lg:text-2xl font-extrabold text-blue-ink tracking-tight text-center">
                      {university.studentCount || "1,000+"}
                    </span>
                  </div>
                  <div className="min-h-[1.75rem] sm:min-h-[2rem] flex items-center justify-center mt-1">
                    <span className="text-xs sm:text-sm font-bold text-sky-deep leading-snug text-center">
                      Active Students & Alumni
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-soft font-medium mt-0.5 leading-tight text-center">
                    Enrolled across diverse programs
                  </span>
                </div>

                {/* Stat 3: Majors & Programs */}
                <div className="flex flex-col items-center text-center px-1 sm:px-4">
                  <div className="h-8 sm:h-9 lg:h-10 flex items-center justify-center">
                    <span className="font-display text-lg sm:text-xl lg:text-2xl font-extrabold text-blue-ink tracking-tight text-center">
                      {totalMajorsCount}+
                    </span>
                  </div>
                  <div className="min-h-[1.75rem] sm:min-h-[2rem] flex items-center justify-center mt-1">
                    <span className="text-xs sm:text-sm font-bold text-sky-deep leading-snug text-center">
                      Specialized Majors
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-soft font-medium mt-0.5 leading-tight text-center">
                    Structured degree curricula
                  </span>
                </div>

                {/* Stat 4: Tuition & Support */}
                <div className="flex flex-col items-center text-center px-1 sm:px-4">
                  <div className="h-8 sm:h-9 lg:h-10 flex items-center justify-center">
                    <span className="font-display text-lg sm:text-xl lg:text-2xl font-extrabold text-blue-ink tracking-tight text-center">
                      {university.scholarshipsList?.length ? "Aid Available" : "Verified"}
                    </span>
                  </div>
                  <div className="min-h-[1.75rem] sm:min-h-[2rem] flex items-center justify-center mt-1">
                    <span className="text-xs sm:text-sm font-bold text-sky-deep leading-snug text-center">
                      Tuition & Scholarships
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-soft font-medium mt-0.5 leading-tight text-center">
                    Published academic financial aid
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Tuition Fee & Admission Requirements Aligned Side-by-Side */}
          {(university.tuitionFee || university.admissionRequirements) && (
            <section className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
                {/* Tuition & Fees Column */}
                {university.tuitionFee && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky/20 bubble-shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="mb-5">
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                          {t("tuitionAndFees")}
                        </h2>
                        <p className="text-xs text-gray-soft font-medium mt-1">
                          {t("tuitionFeesSubtitle")}
                        </p>
                      </div>

                      {/* Summary Rate Banner */}
                      <div className="bg-sitomo/50 rounded-2xl p-4 sm:p-5 border border-sky/20 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-soft block">
                            {t("standardTuitionFee")}
                          </span>
                          <span className="font-display text-base sm:text-lg font-extrabold text-blue-ink mt-0.5 block">
                            {university.tuitionFee}
                          </span>
                        </div>
                        <span className="text-xs text-sky-deep font-bold bg-white px-3 py-1 rounded-full border border-sky/20 w-fit shrink-0">
                          {t("verifiedAcademicRates")}
                        </span>
                      </div>

                      {/* Detailed Breakdown List */}
                      {university.tuitionDetails && university.tuitionDetails.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-soft mb-2">
                            {t("feeBreakdown")}
                          </h3>
                          <div className="space-y-2">
                            {university.tuitionDetails.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-powder border border-sky/15 hover:border-sky/40 transition-colors"
                              >
                                <span className="text-xs font-semibold text-blue-ink pr-2">
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
                  </div>
                )}

                {/* Admission Requirements Column */}
                {university.admissionRequirements && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky/20 bubble-shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="mb-5">
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                          {t("admission")}
                        </h2>
                        <p className="text-xs text-gray-soft font-medium mt-1">
                          Key requirements and timelines to prepare your application
                        </p>
                      </div>

                      {/* Checklist Requirements */}
                      <div className="space-y-3 mb-6">
                        {university.admissionRequirements.map((req) => (
                          <div key={req} className="flex items-start gap-3 p-2.5 rounded-xl bg-powder/60 border border-sky/15">
                            <CheckCircle2 className="w-4 h-4 text-sky-deep shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm font-semibold text-blue-ink">
                              {req}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Application Deadline Box */}
                    {university.applicationDeadline && (
                      <div className="bg-sitomo/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-sky/20 mt-auto">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-soft block">
                            {t("applicationDeadline")}
                          </span>
                          <span className="font-display text-sm sm:text-base font-extrabold text-sky-deep mt-0.5 block">
                            {university.applicationDeadline}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-sky/20 shadow-2xs shrink-0">
                          <Calendar className="w-5 h-5 text-sky-deep" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 4. Degree Programs Section — ONLY for CADT page */}
          {isCadt && (university.undergraduate || university.graduate) && (
            <section className="w-full">
              <div className="mb-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                  Degree Programs
                </h2>
                <p className="text-xs text-gray-soft font-medium mt-1">
                  Comprehensive undergraduate and postgraduate degree pathways
                </p>
              </div>

              {/* 2-Column Side-by-Side Degree Level Cards (Undergraduate & Graduate) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Undergraduate Card */}
                {university.undergraduate && (
                  <div className="bg-white rounded-3xl overflow-hidden border border-sky/20 bubble-shadow-sm flex flex-col">
                    <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-sitomo/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={university.undergraduate.image}
                        alt={university.undergraduate.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-blue-ink mb-1.5">
                          {university.undergraduate.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium">
                          {university.undergraduate.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-sky/15 flex items-center gap-2 text-xs font-bold text-sky-deep">
                        <CheckCircle2 className="w-4 h-4 text-sky-deep shrink-0" />
                        <span>Project-based foundation & industry readiness</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Graduate Card */}
                {university.graduate && (
                  <div className="bg-white rounded-3xl overflow-hidden border border-sky/20 bubble-shadow-sm flex flex-col">
                    <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-sitomo/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={university.graduate.image}
                        alt={university.graduate.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-blue-ink mb-1.5">
                          {university.graduate.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium">
                          {university.graduate.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-sky/15 flex items-center gap-2 text-xs font-bold text-sky-deep">
                        <CheckCircle2 className="w-4 h-4 text-sky-deep shrink-0" />
                        <span>Specialized research & advanced thesis tracks</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Academic Program Highlights Grid */}
              {university.programs && university.programs.length > 0 && (
                <div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-blue-ink mb-3">
                    {t("programHighlights")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {university.programs.map((program) => {
                      const Icon = getProgramIcon(program.iconName);
                      return (
                        <div
                          key={program.title}
                          className="rounded-3xl border border-sky/25 bg-white p-5 sm:p-6 bubble-shadow-sm hover:border-sky hover:shadow-md transition-all flex flex-col items-center text-center rounded-br-[48px]"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-sitomo/80 flex items-center justify-center border border-sky/20 shadow-2xs mb-3.5">
                            <Icon className="w-5 h-5 text-blue-ink" strokeWidth={2.2} />
                          </div>

                          <h4 className="font-display text-sm sm:text-base font-bold text-blue-ink mb-1.5">
                            {program.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium">
                            {program.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 5. Comprehensive Faculties & Degree Majors Directory */}
          {university.facultiesList && university.facultiesList.length > 0 && (
            <section className="w-full">
              <div className="mb-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                  {t("facultiesAndDegreeMajors")}
                </h2>
                <p className="text-xs text-gray-soft font-medium mt-1">
                  {t("facultiesSubtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {university.facultiesList.map((faculty, fIdx) => (
                  <div
                    key={fIdx}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-sky/20 bubble-shadow-sm flex flex-col justify-between hover:border-sky/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-sky/15">
                        <h3 className="font-display text-sm sm:text-base font-bold text-blue-ink">
                          {faculty.facultyName}
                        </h3>
                        <span className="text-[10px] font-extrabold text-sky-deep bg-powder px-2 py-0.5 rounded-full border border-sky/20 shrink-0">
                          {faculty.majors.length} {faculty.majors.length === 1 ? t("major") : t("majorsPlural")}
                        </span>
                      </div>

                      {/* List of Majors */}
                      <ul className="space-y-2 pt-1">
                        {faculty.majors.map((major, mIdx) => (
                          <li
                            key={mIdx}
                            className="flex items-start gap-2 text-xs sm:text-sm font-medium text-blue-ink leading-relaxed"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-deep shrink-0 mt-1.5" />
                            <span>{major}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. Campus Highlights & Facilities */}
          {university.facilities && university.facilities.length > 0 && (
            <section className="w-full">
              <div className="mb-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                  {t("campusFacilities")}
                </h2>
                <p className="text-xs text-gray-soft font-medium mt-1">
                  State-of-the-art learning spaces, laboratories, and student hubs
                </p>
              </div>

              {/* Compact Gallery Grid - Text reveals on hover, image does not zoom */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5">
                {university.facilities.map((fac, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-sky/20 bubble-shadow-sm hover:border-sky/50 transition-all cursor-pointer bg-sitomo/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fac.image}
                      alt={fac.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Dark gradient overlay + text visible on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
                      <span className="text-white text-xs sm:text-sm font-bold drop-shadow-md line-clamp-2">
                        {fac.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 7. Scholarships & Financial Aid */}
          <section className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                  {t("scholarshipsAndFinancialAid")}
                </h2>
                <p className="text-xs text-gray-soft font-medium mt-1">
                  {t("scholarshipsSubtitle")}
                </p>
              </div>
              <Link
                href="/scholarships"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-deep hover:text-blue-ink shrink-0 transition-colors"
              >
                All scholarships <span aria-hidden="true">→</span>
              </Link>
            </div>

            {universityScholarships.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl">
                {universityScholarships.map((scholarship) => (
                  <ScholarshipCard
                    key={scholarship.id}
                    scholarship={scholarship}
                    showProvider={false}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky/15 bubble-shadow-sm text-center max-w-xl">
                <Award className="w-10 h-10 text-sky-deep mx-auto mb-2 opacity-60" />
                <h3 className="font-display text-base font-bold text-blue-ink mb-1">
                  No institutional scholarships currently listed
                </h3>
                <p className="text-xs text-gray-soft mb-4">
                  Explore national and foundation scholarships available to students across Cambodia.
                </p>
                <Link
                  href="/scholarships"
                  className="inline-flex items-center px-4 py-2 rounded-full bg-[#7AB3B7] hover:bg-[#68A1A5] text-white text-xs font-bold transition-colors bubble-shadow-sm"
                >
                  Browse all scholarships
                </Link>
              </div>
            )}
          </section>

          {/* 8. Location & Campus Inquiries */}
          <section className="w-full">
            <div className="mb-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                {t("locationAndCampusMap")}
              </h2>
              <p className="text-xs text-gray-soft font-medium mt-1">
                Find the campus, explore branches, or open navigation in Google Maps
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-sky/20 bubble-shadow-sm max-w-3xl">
              <div className="relative w-full h-60 sm:h-72 lg:h-80 rounded-2xl overflow-hidden border border-sky/15 mb-5 bg-sitomo/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    university.mapImage?.startsWith("public/")
                      ? `/${university.mapImage.slice(7)}`
                      : university.mapImage
                  }
                  alt={`${university.name} Location Map`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-ink flex items-center gap-1.5 shadow-sm border border-sky/15">
                  <MapPin className="w-3.5 h-3.5 text-sky-deep" />
                  <span>{university.location}</span>
                </div>
              </div>

              {/* Branch links if multiple branches exist, or direct map link */}
              {university.branches && university.branches.length > 0 ? (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-soft block">
                    {t("campusBranches")}
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
                        <span>{branch.name} — {t("googleMaps")}</span>
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
                  <span>{t("openInGoogleMaps")}</span>
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
