import { notFound } from "next/navigation";
import { getScholarship, getScholarships } from "@/app/lib/api.server";
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

  // 404 and 400 (a malformed id) both come back as null.
  if (!detail) notFound();

  return <ScholarshipDetail detail={detail} all={all} />;
}
