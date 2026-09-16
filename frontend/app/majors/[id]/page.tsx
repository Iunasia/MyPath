import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { MAJORS_DATA } from "@/app/data/majors";
import { UNIVERSITIES_DATA } from "@/app/data/universities";
import { CAREERS_DATA } from "@/app/data/careers";
import {
  getCareers,
  getMajor,
  getMajors,
  getScholarships,
  getUniversities,
} from "@/app/lib/api.server";
import {
  linkCareers,
  linkUniversities,
  toMajorView,
  toCareerViews,
  toMajorViews,
  toUniversityViews,
  type MajorView,
} from "@/app/lib/catalogAdapters";
import { toScholarshipViews } from "@/app/lib/adapters";
import Footer from "@/app/components/Footer";
import BackLink from "@/app/components/BackLink";
import SaveItemButton from "@/app/components/SaveItemButton";
import ShareButton from "@/app/components/ShareButton";

/** Rendered per request — see the note on the career detail page. */
export const dynamic = "force-dynamic";

/* ── Major Detail Page ─────────────────────────────────── */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MajorDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Relationships are stored as names, so the related records are fetched and
  // resolved here rather than being foreign keys.
  const [row, majorRows, universityRows, scholarshipRows, careerRows] = await Promise.all([
    getMajor(id),
    getMajors(),
    getUniversities(),
    getScholarships(),
    getCareers(),
  ]);

  const fallbackMajor = MAJORS_DATA.find(
    (m) => m.id.toLowerCase() === id.toLowerCase() || String(m.id) === id
  );

  if (!row && !fallbackMajor) {
    notFound();
  }

  const major: MajorView = row
    ? toMajorView(row)
    : ({
        id: fallbackMajor!.id,
        name: fallbackMajor!.name,
        category: fallbackMajor!.category,
        categoryKey: fallbackMajor!.category,
        description: fallbackMajor!.description,
        icon: fallbackMajor!.icon,
        iconBg: fallbackMajor!.iconBg,
        iconColor: fallbackMajor!.iconColor,
        heroImage: fallbackMajor!.heroImage,
        tags: fallbackMajor!.tags,
        subjects: (fallbackMajor as any)?.subjects ?? [],
        duration: fallbackMajor!.duration,
        degreeType: fallbackMajor!.degreeType,
        personalityFit: (fallbackMajor as any)?.personalityFit ?? [],
        jobMarketDemand: fallbackMajor!.jobMarketDemand,
        relatedCareersText: fallbackMajor?.careerPathways?.map((c) => c.title) ?? [],
        universitiesText: fallbackMajor?.offerUniversities?.map((u) => u.shortName || u.name) ?? [],
        relatedScholarshipsText: (fallbackMajor as any)?.relatedScholarships?.map((s: any) => s.title) ?? [],
        source: null,
        sourceUrl: null,
        extendedDescription: fallbackMajor?.extendedDescription ?? null,
        whatYouLearn: fallbackMajor?.whatYouLearn ?? [],
        skillsDeveloped: fallbackMajor?.skillsDeveloped ?? [],
        careerOpportunities: "",
      } as any);

  const allMajors = toMajorViews(majorRows);
  const allScholarships = toScholarshipViews(scholarshipRows);

  // ── Universities offering this major ─────────────────────────
  const universityViews = toUniversityViews(universityRows);

  // 1. Spreadsheet/API links
  const { links: universityLinks } = linkUniversities(
    major.universitiesText,
    universityViews
  );
  const fromApiLinks = universityLinks
    .map((link) => {
      const u = universityViews.find((v) => v.id === link.id);
      const curated = UNIVERSITIES_DATA.find((c) => c.id.toLowerCase() === link.id.toLowerCase());
      if (!u && !curated) return null;
      return {
        id: u?.id || curated?.id || link.id,
        name: u?.name || curated?.name || link.name,
        shortName: u?.shortName || curated?.shortName || link.name,
        location: u?.location || curated?.location || "Phnom Penh",
        type: u?.type || curated?.type || "University",
        image:
          curated?.heroImage ||
          curated?.image ||
          u?.image ||
          "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80",
      };
    })
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  // 2. Curated offerUniversities from fallbackMajor
  const fromFallbackOffer = (fallbackMajor?.offerUniversities ?? [])
    .map((item) => {
      const sName = (item.shortName || "").toLowerCase();
      const fName = (item.name || "").toLowerCase();
      const matched = UNIVERSITIES_DATA.find(
        (c) =>
          c.id.toLowerCase() === sName ||
          c.shortName.toLowerCase() === sName ||
          (item.shortName === "Paragon.U" && c.id === "paragon") ||
          c.name.toLowerCase().includes(fName) ||
          (fName && fName.includes(c.name.toLowerCase())) ||
          (sName && c.shortName.toLowerCase().includes(sName))
      );
      if (matched) {
        return {
          id: matched.id,
          name: matched.name,
          shortName: matched.shortName,
          location: matched.location,
          type: matched.type,
          image: matched.heroImage || matched.image || item.image,
        };
      }
      return null;
    })
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  // 3. Reverse lookup from UNIVERSITIES_DATA (universities whose popularMajors, facultiesList, or programs match this major)
  const majorNameLower = major.name.toLowerCase();
  const majorWords = majorNameLower
    .split(/[\s&,/]+/)
    .filter((w) => w.length > 3 && !["engineering", "studies", "management", "arts"].includes(w));

  const fromCuratedOffer = UNIVERSITIES_DATA.filter((u) => {
    const checkText = (text: string) => {
      const tl = text.toLowerCase();
      if (tl.includes(majorNameLower) || majorNameLower.includes(tl)) return true;
      if (majorWords.length > 0 && majorWords.every((w) => tl.includes(w))) return true;
      return false;
    };

    const inPopular = u.popularMajors.some(checkText);
    if (inPopular) return true;

    const inFaculty = u.facultiesList?.some(
      (f) => checkText(f.facultyName) || f.majors.some(checkText)
    );
    if (inFaculty) return true;

    const inProgram = u.programs?.some((p) => checkText(p.title) || checkText(p.description));
    return Boolean(inProgram);
  }).map((u) => ({
    id: u.id,
    name: u.name,
    shortName: u.shortName,
    location: u.location,
    type: u.type,
    image: u.heroImage || u.image,
  }));

  // Combine direct matches first, then deduplicate by university id
  const offerUniversities: Array<{
    id: string;
    name: string;
    shortName: string;
    location: string;
    type: string;
    image: string;
  }> = [];
  const seenUniIds = new Set<string>();

  for (const uni of [...fromApiLinks, ...fromFallbackOffer, ...fromCuratedOffer]) {
    if (uni.id && !seenUniIds.has(uni.id.toLowerCase())) {
      seenUniIds.add(uni.id.toLowerCase());
      offerUniversities.push(uni);
    }
  }

  // Same field, excluding this one.
  const relatedMajors =
    allMajors.length > 0
      ? allMajors.filter((m) => m.id !== major.id && m.category === major.category).slice(0, 3)
      : (fallbackMajor?.relatedMajors?.map((rm) => ({
          id: rm.id,
          name: rm.name,
          category: major.category,
          categoryKey: major.categoryKey,
          description: "",
          icon: rm.icon,
          iconBg: "bg-sitomo",
          iconColor: "text-sky-deep",
          heroImage: "",
          tags: [],
          subjects: [],
          duration: null,
          degreeType: null,
          personalityFit: [],
          jobMarketDemand: "",
          relatedCareersText: [],
          universitiesText: [],
          relatedScholarshipsText: [],
          source: null,
          sourceUrl: null,
          extendedDescription: null,
          whatYouLearn: [],
          skillsDeveloped: [],
          careerOpportunities: "",
        })) ?? []);

  // Careers this major leads to, resolved from the names in the sheet.
  const allCareers = toCareerViews(careerRows);
  const { links: careerLinks } = linkCareers(major.relatedCareersText, allCareers);

  const fromLinks = careerLinks.map((link) => {
    const record = allCareers.find((c) => c.id === link.id);
    return {
      id: link.id,
      title: link.name,
      description: record?.whatYouDo ?? "",
      icon: link.icon,
    };
  });

  const fromFallback = (fallbackMajor?.careerPathways ?? []).map((cp) => {
    const matchedCareer = CAREERS_DATA.find((c) => c.title.toLowerCase().includes(cp.title.toLowerCase()));
    return {
      id: matchedCareer?.id ?? cp.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      title: cp.title,
      description: cp.description,
      icon: cp.icon,
    };
  });

  // Start with links from the catalog, then fill up with curated fallback so there are at least 3
  const combinedPathways = [...fromLinks];
  for (const item of fromFallback) {
    if (combinedPathways.length >= 3) break;
    const exists = combinedPathways.some(
      (p) => p.title.toLowerCase() === item.title.toLowerCase() || p.id === item.id
    );
    if (!exists) {
      combinedPathways.push(item);
    }
  }

  // If still fewer than 3, supplement from CAREERS_DATA in matching category
  if (combinedPathways.length < 3) {
    const categoryCareers = CAREERS_DATA.filter(
      (c) =>
        c.category.toLowerCase().includes(major.categoryKey.toLowerCase()) ||
        major.category.toLowerCase().includes(c.category.toLowerCase())
    );
    for (const c of [...categoryCareers, ...CAREERS_DATA]) {
      if (combinedPathways.length >= 3) break;
      const exists = combinedPathways.some(
        (p) => p.title.toLowerCase() === c.title.toLowerCase() || p.id === c.id
      );
      if (!exists) {
        combinedPathways.push({
          id: c.id,
          title: c.title,
          description: c.whatYouDo || c.shortOverview,
          icon: c.icon,
        });
      }
    }
  }

  const careerPathways = combinedPathways.slice(0, 3);

  const hasDemand = Boolean(major.jobMarketDemand) && major.jobMarketDemand !== "Not stated";

  // Scholarships this major's sheet points at, matched by title.
  const relatedOpportunities = major.relatedScholarshipsText
    .map((name) => {
      const needle = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return allScholarships.find((s) => {
        const title = s.title.toLowerCase().replace(/[^a-z0-9]/g, "");
        return title.includes(needle) || needle.includes(title);
      });
    })
    .filter((s): s is (typeof allScholarships)[number] => Boolean(s))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      {/* Full-width responsive container: exactly 25px on mobile, 80px on desktop */}
      <div className="w-full px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        
        <BackLink href="/majors" label="Back" className="mb-6" />

        {/* ── Main Content: Full Screen with 80px Desktop Margins ── */}
        <main className="w-full pb-16 flex flex-col gap-10">
          
          {/* 1. Header & Hero Section */}
          <section className="w-full">
            {/* Category Pill */}
            <div className="mb-3">
              <span className="inline-block px-4 py-1.5 rounded-full bg-sky/20 text-sky-deep text-xs font-extrabold uppercase tracking-wider border border-sky/20">
                {major.categoryKey}
              </span>
            </div>

            {/* Major Title */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15] mb-4">
              {major.name}
            </h1>

            {/* Overview Paragraphs */}
            <div className="text-sm sm:text-base lg:text-lg text-gray-body leading-relaxed font-medium mb-6 max-w-4xl space-y-3.5">
              {(major.extendedDescription || major.description)
                .split("\n\n")
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>

            {/* Full Width Hero Image Banner */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[420px] rounded-3xl overflow-hidden mb-6 border border-sky/20 bubble-shadow-sm bg-sitomo/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={major.heroImage}
                alt={major.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white text-xs sm:text-sm font-bold">
                <div className="flex items-center gap-2">
                  <span className="bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
                    {major.degreeType}
                  </span>
                  <span className="bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
                    {major.duration}
                  </span>
                </div>
                {/* "Not stated" is the adapter's placeholder, not a level —
                    it read as "Not stated Demand". */}
                {hasDemand && (
                  <span className="bg-sky-deep/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/25 text-white font-extrabold shadow-sm">
                    {major.jobMarketDemand} demand
                  </span>
                )}
              </div>
            </div>

            {/* Save, Compare, Share */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
              <SaveItemButton
                item={{
                  id: major.id,
                  type: "major",
                  title: major.name,
                  subtitle: major.categoryKey,
                  image: major.heroImage,
                  link: `/majors/${major.id}`,
                }}
                className="w-full sm:w-auto"
              />
              <div className="flex items-center gap-3">
                <ShareButton title={major.name} />
              </div>
            </div>
          </section>

          {/* 2. What you'll learn (Full Width Card, 2-column grid on desktop) */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-sky/15 bubble-shadow-sm w-full rounded-br-[86px]">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-8">
              What you&apos;ll learn
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {major.whatYouLearn.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-sitomo/20 border border-sky/10"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-sitomo flex items-center justify-center shrink-0 border border-sky/15">
                      <Icon className="w-6 h-6 text-sky-deep" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-blue-ink">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-body leading-relaxed mt-1 font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Skills Developed (Full Width Card with spacious pills) */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-sky/15 bubble-shadow-sm w-full">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-6">
              Skills Developed
            </h2>
            <div className="flex flex-wrap gap-3">
              {major.skillsDeveloped.map((skill) => (
                <span
                  key={skill}
                  className="bg-momo text-blue-ink text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full border border-momo/70 shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* 4. Career Pathways (Centered, No Card Background) */}
          <section className="w-full">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-blue-ink tracking-tight text-center mb-10">
              Career Pathways
            </h2>

            <div
              className={`gap-8 lg:gap-12 max-w-5xl mx-auto w-full ${
                careerPathways.length === 1
                  ? "flex justify-center"
                  : careerPathways.length === 2
                  ? "flex flex-col sm:flex-row justify-center items-center sm:items-start"
                  : "grid grid-cols-1 md:grid-cols-3"
              }`}
            >
              {careerPathways.map((career) => {
                const Icon = career.icon;
                return (
                  <div
                    key={career.title}
                    className={`flex flex-col items-center text-center px-4 ${
                      careerPathways.length < 3 ? "w-full sm:max-w-xs" : ""
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-momo text-sky-deep flex items-center justify-center mb-4 border border-momo/80 shadow-2xs">
                      <Icon className="w-8 h-8 text-sky-deep" strokeWidth={2.2} />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink mb-2">
                      {career.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium max-w-xs">
                      {career.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Career Opportunities Sector Card */}
            {major.careerOpportunities && (
              <div className="mt-8 p-6 sm:p-7 rounded-3xl bg-white border border-sky/15 bubble-shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-5xl mx-auto">
                <div>
                  <span className="text-xs font-bold text-gray-soft uppercase tracking-wider block mb-1">
                    Industry Hiring Sectors & Employers
                  </span>
                  <p className="font-display text-base sm:text-lg font-bold text-blue-ink">
                    {major.careerOpportunities}
                  </p>
                </div>
                {hasDemand && (
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sitomo text-xs font-bold text-sky-deep border border-sky/20 shadow-2xs">
                      Demand: {major.jobMarketDemand}
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 5. Related Majors — only when the field has others; an empty
              heading read as a broken section. */}
          {relatedMajors.length > 0 && (
          <section className="w-full">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink tracking-tight mb-6">
              Related Majors
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedMajors.map((rel) => {
                const Icon = rel.icon;
                return (
                  <Link
                    key={rel.id}
                    href={`/majors/${rel.id}`}
                    className="flex flex-col items-center justify-center p-7 sm:p-8 bg-white border-2 border-sky/50 rounded-3xl rounded-br-[56px] bubble-shadow-sm hover:border-sky hover:shadow-md hover:scale-[1.02] transition-all text-center group cursor-pointer min-h-[160px]"
                  >
                    <div className="w-14 h-14 rounded-full bg-momo flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-blue-ink" strokeWidth={2} />
                    </div>
                    <span className="font-display text-base font-bold text-blue-ink group-hover:text-sky-deep transition-colors leading-snug">
                      {rel.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
          )}

          {/* 6. Related Opportunities (Full Width Grid) */}
          {relatedOpportunities.length > 0 && (
            <section className="w-full">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink tracking-tight mb-6">
                Related Opportunity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedOpportunities.map((opp) => (
                  <div
                    key={opp.title}
                    className="flex flex-col sm:flex-row items-center gap-5 bg-white rounded-3xl p-5 border border-sky/15 bubble-shadow-sm hover:border-sky/35 transition-all"
                  >
                    <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden shrink-0 border border-sky/10 bg-sitomo/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={opp.image}
                        alt={opp.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-3 py-1 rounded-full bg-sitomo text-sky-deep text-[10px] font-bold mb-2 border border-sky/10">
                        {opp.coverage}
                      </span>
                      <h3 className="font-display text-base font-bold text-blue-ink leading-snug mb-2">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-gray-soft font-medium">
                        {opp.provider} · Deadline: {opp.deadline}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 7. Universities Offering This Major (uses same card style as university page) */}
          {offerUniversities.length > 0 && (
            <section className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink tracking-tight">
                  Universities offering this major
                </h2>
                <span className="text-xs font-semibold text-gray-soft">
                  {offerUniversities.length} {offerUniversities.length === 1 ? "university" : "universities"}
                </span>
              </div>

              {/* Exact card style and grid from /universities page */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
                {offerUniversities.map((uni) => (
                  <Link
                    key={uni.id}
                    href={`/universities/${uni.id}`}
                    className="group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bubble-shadow-sm border border-sky/15 hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-all duration-300 block"
                  >
                    {/* University Campus Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uni.image}
                      alt={uni.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                    {/* Type Badge on Top */}
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
                      <span className="bg-black/40 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/15">
                        {uni.type}
                      </span>
                    </div>

                    {/* Save Button on Card Image */}
                    <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20">
                      <SaveItemButton
                        variant="card-action"
                        item={{
                          id: uni.id,
                          type: "university",
                          title: uni.name,
                          subtitle: uni.shortName,
                          image: uni.image,
                          link: `/universities/${uni.id}`,
                        }}
                      />
                    </div>

                    {/* Bottom Text Content */}
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col justify-end">
                      <h3 className="font-display font-bold text-white text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-sm mb-2 group-hover:text-sky-bright transition-colors">
                        {uni.name}
                      </h3>

                      <div className="flex items-center justify-between gap-1 text-white">
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-white/90 font-medium truncate">
                          <MapPin className="w-3 h-3 text-sitomo shrink-0" />
                          <span className="truncate">{uni.location}</span>
                        </span>

                        <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 shrink-0 shadow-2xs">
                          {uni.shortName}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </main>
      </div>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
