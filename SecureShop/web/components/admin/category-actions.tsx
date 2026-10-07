"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateCategoryForm() {
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
    try {
      const res = await fetch("/api/proxy/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: String(form.get("description") ?? ""),
        }),
      });
      const body = (await res.json().catch(() => null)) as { error?: string; message?: string; errors?: { message?: string }[] } | null;
      if (!res.ok) {
        setError(body?.error || body?.errors?.[0]?.message || body?.message || "Gagal membuat kategori");
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
      <h2 className="font-semibold">Kategori baru</h2>
      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      <input name="name" required placeholder="Nama" className="w-full rounded border border-neutral-300 px-2 py-1" />
      <input name="slug" placeholder="Slug (kosong = dari nama)" className="w-full rounded border border-neutral-300 px-2 py-1" />
      <textarea name="description" placeholder="Deskripsi" className="w-full rounded border border-neutral-300 px-2 py-1" />
      <button type="submit" disabled={pending} className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-60">
        {pending ? "Menyimpan…" : "Simpan"}
      </button>
    </form>
  );
}

export function DeleteCategory({ id }: { id: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    const res = await fetch(`/api/proxy/admin/categories/${id}`, { method: "DELETE" });
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setError(body?.error || "Gagal menghapus");
      return;
    }
    router.refresh();
  }

  return (
    <div className="text-sm">
      <button type="button" className="underline" onClick={onClick}>
        Hapus
      </button>
      {error ? <p className="text-red-700">{error}</p> : null}
    </div>
  );
}
