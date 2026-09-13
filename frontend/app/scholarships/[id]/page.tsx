import { notFound } from "next/navigation";
import { getScholarship, getScholarships } from "@/app/lib/api.server";
import { SCHOLARSHIPS_DATA } from "@/app/data/scholarships";
import ScholarshipDetail from "./ScholarshipDetail";

/**
 * Fetched on the server, so the page arrives filled in instead of showing
 * "Loading scholarship…" first. The full list comes along for "Similar
 * scholarships".
 */
export const dynamic = "force-dynamic";

export default async function ScholarshipDetailPage({ params }: PageProps<"/scholarships/[id]">) {
  const { id } = await params;
  const [detail, all] = await Promise.all([getScholarship(id), getScholarships()]);

  const fallback = SCHOLARSHIPS_DATA.find(
    (s) => s.id.toLowerCase() === id.toLowerCase() || String(s.id) === id
  );

  if (!detail && !fallback) notFound();

  const resolvedDetail = detail ?? {
    title: fallback!.title,
    scholarship: {
      id: 1,
      slug: fallback!.id,
      title: fallback!.title,
      provider: fallback!.provider,
      coverage: fallback!.coverage,
      degree_level: fallback!.degreeLevel,
      deadline: fallback!.deadline,
      category: fallback!.category,
      source_url: fallback!.officialSource,
      image_url: fallback!.image,
      description: `${fallback!.coverage} scholarship offered by ${fallback!.provider}.`,
      eligibility: fallback!.eligibility,
      benefits: fallback!.benefits,
      requirements: fallback!.requiredDocuments,
      application_process: fallback!.applicationProcess,
      target_majors: fallback!.targetMajors,
      last_verified_at: fallback!.lastVerified,
      is_verified: fallback!.isVerified,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any,
    infoCheck: {
      verifiedStatus: fallback!.isVerified ? ("verified" as const) : ("unverified" as const),
      sourceType: "official" as const,
      isRisky: false,
      lastChecked: fallback!.lastVerified,
      reasons: [],
      source: fallback!.officialSource,
      sourceUrl: fallback!.officialSource,
      lastVerified: fallback!.lastVerified,
      summary: `${fallback!.coverage} scholarship offered by ${fallback!.provider}.`,
    } as any,
  } as any;

  return <ScholarshipDetail detail={resolvedDetail} all={all ?? []} />;
}
