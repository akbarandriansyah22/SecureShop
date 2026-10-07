"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

async function readError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string; message?: string; errors?: { message?: string }[] } | null;
  return body?.error || body?.errors?.[0]?.message || body?.message || `Gagal (${res.status})`;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateProductForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const slug = String(form.get("slug") ?? "").trim() || slugify(name);
    const categoryRaw = String(form.get("category_ids") ?? "").trim();
    const category_ids = categoryRaw
      ? categoryRaw.split(",").map((part) => Number(part.trim())).filter((id) => Number.isFinite(id) && id > 0)
      : undefined;
    try {
      const res = await fetch("/api/proxy/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: String(form.get("description") ?? ""),
          price: Number(form.get("price")),
          stock: Number(form.get("stock")),
          sku: String(form.get("sku") ?? ""),
          image_url: String(form.get("image_url") ?? ""),
          category_ids,
        }),
      });
      if (!res.ok) {
        setError(await readError(res));
        return;
      }
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-2 rounded border border-neutral-200 bg-white p-4">
      <h2 className="font-semibold">Produk baru</h2>
      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      <input name="name" required placeholder="Nama" className="w-full rounded border border-neutral-300 px-2 py-1" />
      <input name="slug" placeholder="Slug (kosong = dari nama)" className="w-full rounded border border-neutral-300 px-2 py-1" />
      <textarea name="description" placeholder="Deskripsi" className="w-full rounded border border-neutral-300 px-2 py-1" />
      <input name="price" type="number" min="1" step="1" required placeholder="Harga" className="w-full rounded border border-neutral-300 px-2 py-1" />
      <input name="stock" type="number" min="0" step="1" required placeholder="Stok" className="w-full rounded border border-neutral-300 px-2 py-1" />
      <input name="sku" placeholder="SKU" className="w-full rounded border border-neutral-300 px-2 py-1" />
      <input name="image_url" placeholder="image_url" className="w-full rounded border border-neutral-300 px-2 py-1" />
      <input name="category_ids" placeholder="category_ids, contoh 1,2" className="w-full rounded border border-neutral-300 px-2 py-1" />
      <button type="submit" disabled={pending} className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-60">
        {pending ? "Menyimpan…" : "Simpan"}
      </button>
    </form>
  );
}

export function ProductRowActions({ id }: { id: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function call(path: string, method: "PUT" | "DELETE") {
    setError(null);
    setPending(true);
    try {
      const res = await fetch(path, { method });
      if (!res.ok) {
        setError(await readError(res));
        return;
      }
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <button type="button" disabled={pending} className="underline" onClick={() => call(`/api/proxy/admin/products/${id}/activate`, "PUT")}>
        Aktifkan
      </button>
      <button type="button" disabled={pending} className="underline" onClick={() => call(`/api/proxy/admin/products/${id}/deactivate`, "PUT")}>
        Nonaktifkan
      </button>
      <button type="button" disabled={pending} className="underline" onClick={() => call(`/api/proxy/admin/products/${id}`, "DELETE")}>
        Hapus
      </button>
      {error ? <span className="text-red-700">{error}</span> : null}
    </div>
  );
}
