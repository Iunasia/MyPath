const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface AuthResponse {
  message?: string;
  user?: User;
  error?: string;
  requiresVerification?: boolean;
}

/** Auth failure carrying the HTTP status and response body, so callers can branch. */
export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
    public data: AuthResponse = {}
  ) {
    super(message);
    this.name = "AuthError";
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new AuthError(0, "Unable to reach the server. Please try again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new AuthError(res.status, data.error || "Something went wrong", data);
  }

  return data as T;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function logoutUser(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/logout");
}

export async function verifyEmail(
  email: string,
  code: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function getCurrentUser(): Promise<{ user: User }> {
  return apiFetch<{ user: User }>("/auth/me");
}

export function getGoogleAuthUrl(): string {
  return `${API_BASE}/auth/google`;
}
