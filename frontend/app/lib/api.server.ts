/**
 * Server-side API client, for React Server Components.
 *
 * The browser reaches the API on the host port (`localhost:5000`), but code
 * running inside the frontend container has to use the Compose service name
 * (`backend:5000`). `BACKEND_INTERNAL_URL` is already set for that in
 * docker-compose.dev.yml; outside Docker it falls back to the public URL.
 *
 * Client components must keep using `./api` — importing this on the client
 * would leak a URL the browser cannot resolve.
 */
import type {
  ApiCareer,
  ApiComparison,
  ApiMajor,
  ApiScholarship,
  ApiUniversity,
  ApiInfoCheck,
} from "./api";

const SERVER_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/**
 * Returns null for 4xx (missing/malformed), throws for 5xx and network faults.
 * Callers turn null into `notFound()`; a genuine outage should surface as an
 * error rather than a misleading "not found" page.
 */
async function getOrNull<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_BASE}${path}`, {
      // Content changes when the team re-seeds, so never serve a stale cache.
      cache: "no-store",
    });

    if (res.status >= 400 && res.status < 500) return null;
    if (!res.ok) return null;

    return res.json() as Promise<T>;
  } catch {
    // Return null when the backend server is offline so callers can use local fallback
    return null;
  }
}

async function getList<T>(path: string): Promise<T[]> {
  const rows = await getOrNull<T[]>(path);
  return rows ?? [];
}

export const getCareers = () => getList<ApiCareer>("/careers");
export const getCareer = (id: string) => getOrNull<ApiCareer>(`/careers/${id}`);

export const getMajors = () => getList<ApiMajor>("/majors");
export const getMajor = (id: string) => getOrNull<ApiMajor>(`/majors/${id}`);

export const getUniversities = () => getList<ApiUniversity>("/universities");
export const getUniversity = (idOrSlug: string) =>
  getOrNull<ApiUniversity>(`/universities/${encodeURIComponent(idOrSlug)}`);

export const getScholarships = () => getList<ApiScholarship>("/scholarships");
export const getScholarship = (id: string) =>
  getOrNull<{ title: string; scholarship: ApiScholarship; infoCheck: ApiInfoCheck }>(
    `/scholarships/${id}`
  );

export type ComparisonResult =
  | { ok: true; comparison: ApiComparison }
  | { ok: false; status: number; error: string; missing?: number[] };

/**
 * Unlike the getters above, the compare page shows the API's reason for a
 * 400 or 404 ("No scholarship with id 99") rather than a generic not-found.
 */
export async function getComparison(type: string, ids: string): Promise<ComparisonResult> {
  const query = `type=${encodeURIComponent(type)}&ids=${encodeURIComponent(ids)}`;
  const res = await fetch(`${SERVER_BASE}/compare?${query}`, { cache: "no-store" });
  const body = await res.json().catch(() => ({}));

  if (res.ok) return { ok: true, comparison: body as ApiComparison };
  if (res.status >= 500) throw new Error(`Upstream API error ${res.status} for /compare`);
  return {
    ok: false,
    status: res.status,
    error: typeof body.error === "string" ? body.error : "We couldn't compare those.",
    missing: Array.isArray(body.missing) ? body.missing : undefined,
  };
}
