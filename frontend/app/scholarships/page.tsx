import type { ApiScholarship } from "@/app/lib/api";
import { getScholarships } from "@/app/lib/api.server";
import ScholarshipsBrowser from "./ScholarshipsBrowser";

/**
 * Fetched on the server, so the page arrives filled in instead of flashing
 * "Loading…" after every navigation. Search and filters stay in the browser.
 */
export const dynamic = "force-dynamic";

export default async function ScholarshipsPage() {
  let rows: ApiScholarship[] = [];
  let loadError: string | null = null;
  try {
    rows = await getScholarships();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load scholarships";
  }
  return <ScholarshipsBrowser rows={rows} loadError={loadError} />;
}
