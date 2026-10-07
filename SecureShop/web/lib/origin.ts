import { NextResponse } from "next/server";

// Missing Origin is allowed (same-site form posts). A present Origin must match this request.
export function rejectCrossOrigin(request: Request): NextResponse | null {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD") return null;

  const origin = request.headers.get("origin");
  if (!origin) return null;

  let expected: string;
  try {
    expected = new URL(request.url).origin;
  } catch {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (origin !== expected) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}
