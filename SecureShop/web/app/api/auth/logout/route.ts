import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, authCookieOptions } from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/origin";

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", authCookieOptions(0));
  return response;
}
