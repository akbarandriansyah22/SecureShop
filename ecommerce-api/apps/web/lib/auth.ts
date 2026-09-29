import { cookies } from "next/headers";
import type { LoginResponse, User } from "./types";

export const ACCESS_TOKEN_COOKIE = "access_token";
// Matches JWT_EXPIRATION_HOURS=2 on the API.
export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 2;

export function authCookieOptions(maxAge = ACCESS_TOKEN_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function apiBase(): string {
  return process.env.API_URL ?? "http://localhost:8080";
}

type AuthEnvelope = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: LoginResponse;
};

export async function readAuthEnvelope(res: Response): Promise<AuthEnvelope | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as AuthEnvelope;
  } catch {
    return { error: text };
  }
}

export function authErrorMessage(body: AuthEnvelope | null, fallback: string): string {
  if (body?.error) return body.error;
  if (body?.message && body.success === false) return body.message;
  return fallback;
}

export async function getSession(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${apiBase()}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: User };
    if (!body.data || typeof body.data.id !== "number") return null;
    return body.data;
  } catch {
    return null;
  }
}
