"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

export function OrderStatusForm({ orderId, status }: { orderId: number; status: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch(`/api/proxy/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: form.get("status") }),
      });
      const body = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
      if (!res.ok) {
        setError(body?.error || body?.message || "Gagal mengubah status");
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
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2 text-sm">
      <select name="status" defaultValue={STATUSES.includes(status as (typeof STATUSES)[number]) ? status : "pending"} className="rounded border border-neutral-300 px-2 py-1">
        {STATUSES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending} className="underline disabled:opacity-60">
        {pending ? "Menyimpan…" : "Ubah status"}
      </button>
      {error ? <span className="text-red-700">{error}</span> : null}
    </form>
  );
}
