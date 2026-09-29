import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, apiBase } from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/origin";

const ALLOWED_PREFIXES = [
  "cart",
  "cart/items",
  "orders",
  "admin/products",
  "admin/categories",
  "admin/orders",
];

function isAllowed(joined: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => joined === prefix || joined.startsWith(`${prefix}/`));
}

async function forward(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (path.some((part) => part === "" || part === "." || part === "..")) {
    return NextResponse.json({ success: false, error: "Invalid path" }, { status: 400 });
  }
  if (!isAllowed(path.join("/"))) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const incoming = new URL(request.url);
  const target = `${apiBase()}/api/${path.join("/")}${incoming.search}`;
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const method = request.method.toUpperCase();
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : await request.text(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ success: false, error: "API tidak terjangkau." }, { status: 502 });
  }

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
