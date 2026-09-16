export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  auth_provider: string;
  avatar_url: string | null;
  avatar_updated_at: string | null;
  is_verified?: boolean;
  bio: string | null;
  location: string | null;
  website: string | null;
  date_of_birth: string | null;
  gender: string | null;
  created_at: string;
}

export interface ProfileUpdateInput {
  name: string;
  bio: string;
  location: string;
  website: string;
  date_of_birth: string;
  gender: string;
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

export class AuthApiError extends AuthError {
  constructor(status: number, message: string, data: AuthResponse = {}) {
    super(status, message, data);
    this.name = "AuthApiError";
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

export async function updateUserProfile(
  fields: ProfileUpdateInput
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/me/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function uploadAvatar(file: File): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${API_BASE}/auth/me/avatar`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data as AuthResponse;
}

export async function removeAvatarRequest(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/me/avatar", { method: "DELETE" });
}

export function getGoogleAuthUrl(): string {
  return `${API_BASE}/auth/google`;
}
