import type { ApiMajor } from "@/app/lib/api";
import { getMajors } from "@/app/lib/api.server";
import MajorsBrowser from "./MajorsBrowser";

/** Fetched on the server so the page arrives filled in — see /scholarships. */
export const dynamic = "force-dynamic";

export default async function MajorsPage() {
  let rows: ApiMajor[] = [];
  let loadError: string | null = null;
  try {
    rows = await getMajors();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load majors";
  }
  return <MajorsBrowser rows={rows} loadError={loadError} />;
}
