import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  apiBase,
  authCookieOptions,
  authErrorMessage,
  readAuthEnvelope,
} from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/origin";

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const input = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBase()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input?.email ?? "",
        password: input?.password ?? "",
      }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ success: false, error: "API auth tidak terjangkau." }, { status: 502 });
  }

  const body = await readAuthEnvelope(upstream);
  const token = body?.data?.token;
  if (!upstream.ok || !token || !body?.data?.user) {
    return NextResponse.json(
      { success: false, error: authErrorMessage(body, "Login gagal") },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  const response = NextResponse.json({
    success: true,
    message: body.message,
    user: body.data.user,
  });
  response.cookies.set(ACCESS_TOKEN_COOKIE, token, authCookieOptions());
  return response;
}
