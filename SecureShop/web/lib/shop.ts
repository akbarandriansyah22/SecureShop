import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, apiBase } from "./auth";
import type { ApiEnvelope, Cart, Order, PageMeta } from "./types";

export type ShopResult<T> = { data: T; error: null } | { data: null; error: string };

async function authed(path: string, init?: RequestInit): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
  }
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${apiBase()}${path}`, { ...init, headers, cache: "no-store" });
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { error: text };
  }
}

export function apiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const record = body as {
    error?: unknown;
    message?: unknown;
    errors?: { message?: string }[];
  };
  if (typeof record.error === "string" && record.error) return record.error;
  const field = record.errors?.find((item) => item.message)?.message;
  if (field) return field;
  if (typeof record.message === "string" && record.message) return record.message;
  return fallback;
}

export async function getCart(): Promise<ShopResult<Cart>> {
  try {
    const res = await authed("/api/cart");
    const body = await readJson(res);
    if (!res.ok) return { data: null, error: apiErrorMessage(body, "Keranjang gagal dimuat") };
    const envelope = body as ApiEnvelope<Cart>;
    if (!envelope?.data) return { data: null, error: apiErrorMessage(body, "Keranjang gagal dimuat") };
    return { data: envelope.data, error: null };
  } catch {
    return { data: null, error: "API keranjang tidak terjangkau." };
  }
}

export async function getAdminOrders(): Promise<ShopResult<{ items: Order[]; total: number }>> {
  try {
    const res = await authed("/api/admin/orders?page=1&limit=50");
    const body = await readJson(res);
    if (!res.ok) return { data: null, error: apiErrorMessage(body, "Order admin gagal dimuat") };
    const page = body as {
      data?: Order[] | null;
      total?: number;
      meta?: PageMeta;
    };
    const items = Array.isArray(page?.data) ? page.data : [];
    const total = typeof page?.total === "number" ? page.total : page?.meta?.total_items ?? items.length;
    return { data: { items, total }, error: null };
  } catch {
    return { data: null, error: "API order tidak terjangkau." };
  }
}

export async function getOrders(): Promise<ShopResult<{ items: Order[]; meta: PageMeta | null }>> {
  try {
    const res = await authed("/api/orders?page=1&limit=50");
    const body = await readJson(res);
    if (!res.ok) return { data: null, error: apiErrorMessage(body, "Order gagal dimuat") };
    const envelope = body as ApiEnvelope<Order[]> & { meta?: PageMeta };
    return {
      data: {
        items: Array.isArray(envelope?.data) ? envelope.data : [],
        meta: envelope?.meta ?? null,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "API order tidak terjangkau." };
  }
}

export async function getOrder(id: string): Promise<ShopResult<Order>> {
  try {
    const res = await authed(`/api/orders/${encodeURIComponent(id)}`);
    const body = await readJson(res);
    if (!res.ok) return { data: null, error: apiErrorMessage(body, "Order tidak ditemukan") };
    const envelope = body as ApiEnvelope<Order>;
    if (!envelope?.data || typeof envelope.data.id !== "number") {
      return { data: null, error: apiErrorMessage(body, "Order tidak ditemukan") };
    }
    return { data: envelope.data, error: null };
  } catch {
    return { data: null, error: "API order tidak terjangkau." };
  }
}
