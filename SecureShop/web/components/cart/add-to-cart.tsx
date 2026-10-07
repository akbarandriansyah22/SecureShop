"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddToCart({
  productId,
  quantity = 1,
  label = "Add to cart",
  className = "rounded bg-neutral-950 px-6 py-3 text-sm text-white disabled:opacity-60",
}: {
  productId: number;
  quantity?: number;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/proxy/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
        errors?: { message?: string }[];
      } | null;
      if (!res.ok) {
        setError(body?.error || body?.errors?.[0]?.message || body?.message || "Gagal menambah ke keranjang");
        return;
      }
      router.push("/cart");
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={className}
      >
        {pending ? "Adding…" : label}
      </button>
    </div>
  );
}
