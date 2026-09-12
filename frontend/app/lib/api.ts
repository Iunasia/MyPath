/**
 * Typed client for the MyPath backend.
 *
 * Mirrors `backend/openapi.yaml`. Field names are the backend's snake_case —
 * translation into the shapes the pages render happens in `adapters.ts`, so
 * there is exactly one place to look when the API changes.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface ApiInfoCheck {
  isRisky: boolean;
  reasons: string[];
  source: string | null;
  sourceUrl: string | null;
  sourceType: "official" | "organisation" | "news" | "social_media" | "unknown";
  verifiedStatus: "verified" | "flagged" | "unverified";
  lastVerified: string | null;
  summary: string;
}

export interface ApiScholarship {
  id: number;
  title: string;
  provider: string;
  provider_type: string;
  description: string;
  amount: string;
  coverage: string;
  eligibility: string;
  degree_level: string | null;
  field_of_study: string | null;
  documents: string[];
  application_process: string | null;
  deadline: string | null;
  deadline_note: string | null;
  application_link: string;
  image_url: string | null;
  country: string;
  opportunity_type: string;
  source: string;
  source_url: string;
  source_type: string;
  verified_status: string;
  last_verified: string | null;
  /** The admin who last checked it; null when nobody has, or the date came from the sheet. */
  last_verified_by: number | null;
  safety_warnings: string[];
  infoCheck: ApiInfoCheck;
}

export interface ApiCareer {
  id: number;
  title: string;
  category: string;
  description: string;
  responsibilities: string | null;
  average_salary: string | null;
  growth_outlook: string | null;
  education_required: string | null;
  personality_fit: string | null;
  required_skills: string[];
  related_majors: string[];
  source: string | null;
  source_url: string | null;
}

export interface ApiMajor {
  id: number;
  name: string;
  field: string;
  description: string;
  duration: string | null;
  degree_type: string | null;
  subjects: string[];
  personality_fit: string | null;
  job_market_demand: string | null;
  related_careers: string[];
  universities: string[];
  related_scholarships: string[];
  source: string | null;
  source_url: string | null;
}

export interface ApiUniversity {
  id: number;
  slug: string | null;
  name: string;
  short_name: string | null;
  country: string;
  city: string;
  type: string | null;
  ranking: number | null;
  description: string;
  website: string;
  phone: string | null;
  established: string | null;
  student_count: string | null;
  image_url: string | null;
  tuition_range: string | null;
  acceptance_rate: string | null;
  programs: string[];
  scholarships: string[];
  source: string;
  source_url: string;
}

export type SavedItemType = "scholarship" | "major" | "career" | "university";

export interface ApiSavedItem {
  user_id: number;
  item_type: SavedItemType;
  item_id: number;
  saved_at: string;
  title: string;
  subtitle: string | null;
  image: string | null;
}

export type RiskLevel = "low" | "caution" | "high";
export type RequestStatus = "pending" | "reviewing" | "resolved";
export type Verdict = "legitimate" | "scam" | "outdated" | "unverifiable";

export interface ApiLinkCheck {
  score: number;
  level: RiskLevel;
  findings: string[];
  passed: string[];
  hostname: string | null;
  sourceType: string;
}

export interface ApiVerificationRequest {
  id: number;
  user_id: number | null;
  scholarship_id: number | null;
  submitted_url: string | null;
  submitted_title: string;
  note: string | null;
  auto_check: ApiLinkCheck | null;
  status: RequestStatus;
  verdict: Verdict | null;
  admin_response: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  read_by_user: boolean;
  created_at: string;
  submitted_by_name?: string | null;
  submitted_by_email?: string | null;
  reviewed_by_name?: string | null;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });

  if (!res.ok) {
    // The backend always answers JSON, including for errors.
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const fetchScholarships = () => get<ApiScholarship[]>("/scholarships");

export const fetchScholarship = (id: number | string) =>
  get<{ title: string; scholarship: ApiScholarship; infoCheck: ApiInfoCheck }>(
    `/scholarships/${id}`
  );

export const fetchCareers = () => get<ApiCareer[]>("/careers");
export const fetchCareer = (id: number | string) => get<ApiCareer>(`/careers/${id}`);

export const fetchMajors = () => get<ApiMajor[]>("/majors");
export const fetchMajor = (id: number | string) => get<ApiMajor>(`/majors/${id}`);

export const fetchUniversities = () => get<ApiUniversity[]>("/universities");
export const fetchUniversity = (id: number | string) =>
  get<ApiUniversity>(`/universities/${id}`);

/* ------------------------------------------------------------------ */
/* Saved items — all require a session                                 */
/* ------------------------------------------------------------------ */

export const fetchSavedItems = () => get<ApiSavedItem[]>("/saved");

async function send(method: "POST" | "DELETE", path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method, credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `Request failed (${res.status})`);
  }
}

export const saveItem = (type: SavedItemType, id: number) =>
  send("POST", `/saved/${type}/${id}`);

export const unsaveItem = (type: SavedItemType, id: number) =>
  send("DELETE", `/saved/${type}/${id}`);

/* ------------------------------------------------------------------ */
/* Verification requests — the DMIL loop                               */
/* ------------------------------------------------------------------ */

async function sendJson<T>(method: string, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || `Request failed (${res.status})`);
  return data as T;
}

export interface SubmitVerificationInput {
  url?: string;
  title?: string;
  note?: string;
  scholarshipId?: number;
}

export const submitVerificationRequest = (input: SubmitVerificationInput) =>
  sendJson<{ request: ApiVerificationRequest; autoCheck: ApiLinkCheck }>(
    "POST",
    "/verification-requests",
    input
  );

/** The student's own requests, with a count of answers they haven't opened. */
export const fetchMyVerificationRequests = () =>
  get<{ requests: ApiVerificationRequest[]; unread: number }>("/verification-requests");

export const fetchVerificationRequest = (id: number) =>
  get<ApiVerificationRequest>(`/verification-requests/${id}`);

/** Admin only. */
export const fetchVerificationQueue = (status?: RequestStatus) =>
  get<ApiVerificationRequest[]>(
    `/verification-requests/all${status ? `?status=${status}` : ""}`
  );

/** Admin only. */
export const reviewVerificationRequest = (
  id: number,
  input: { status: RequestStatus; verdict?: Verdict | null; response?: string }
) => sendJson<ApiVerificationRequest>("PATCH", `/verification-requests/${id}`, input);

/** Admin only. Records that you checked the listing against its source (MVP #8). */
export const markScholarshipChecked = (id: number) =>
  sendJson<{ scholarship: ApiScholarship; infoCheck: ApiInfoCheck }>(
    "POST",
    `/scholarships/${id}/verify`,
    {}
  );
