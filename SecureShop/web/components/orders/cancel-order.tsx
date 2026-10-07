"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelOrder({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/proxy/orders/${orderId}/cancel`, { method: "POST" });
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(body?.error || "Gagal membatalkan order");
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
    <div className="space-y-2">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="button" onClick={onClick} disabled={pending} className="rounded border border-neutral-400 px-3 py-1.5 text-sm disabled:opacity-60">
        {pending ? "Membatalkan…" : "Batalkan order"}
      </button>
    </div>
  );
}
