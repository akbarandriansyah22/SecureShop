"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PAYMENT_METHODS = ["bank_transfer", "credit_card", "e_wallet", "cod"] as const;

export function CheckoutForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/proxy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_address: form.get("shipping_address"),
          shipping_phone: form.get("shipping_phone"),
          notes: form.get("notes") || "",
          payment_method: form.get("payment_method"),
        }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
        errors?: { message?: string }[];
        data?: { id?: number };
      } | null;
      if (!res.ok || typeof body?.data?.id !== "number") {
        setError(body?.error || body?.errors?.[0]?.message || body?.message || "Checkout gagal");
        return;
      }
      router.push(`/orders/${body.data.id}`);
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto my-10 max-w-lg space-y-3 border border-neutral-200 p-6">
      <h1 className="font-serif text-3xl font-normal">Checkout</h1>
      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      <label className="block text-sm">
        Alamat pengiriman
        <textarea name="shipping_address" required className="mt-1 w-full rounded border border-neutral-300 px-2 py-1" />
      </label>
      <label className="block text-sm">
        Telepon
        <input name="shipping_phone" required className="mt-1 w-full rounded border border-neutral-300 px-2 py-1" />
      </label>
      <label className="block text-sm">
        Catatan
        <textarea name="notes" className="mt-1 w-full rounded border border-neutral-300 px-2 py-1" />
      </label>
      <label className="block text-sm">
        Metode pembayaran
        <select name="payment_method" required className="mt-1 w-full rounded border border-neutral-300 px-2 py-1" defaultValue="">
          <option value="" disabled>
            Pilih
          </option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-neutral-600">
        API menolak checkout tanpa payment_method. Nilai yang diterima: bank_transfer, credit_card, e_wallet, cod.
      </p>
      <button type="submit" disabled={pending} className="w-full bg-neutral-950 py-3 text-sm text-white disabled:opacity-60">
        {pending ? "Placing…" : "Place order"}
      </button>
    </form>
  );
}
