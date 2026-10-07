"use client";

import { useState } from "react";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  return (
    <footer id="contact" className="mt-16 bg-neutral-950 text-neutral-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="font-serif text-2xl text-white">SecureShop.</p>
          <p className="mt-3 text-sm text-neutral-400">Music and home goods, delivered with care.</p>
        </div>
        <div className="text-sm">
          <p className="mb-3 text-xs tracking-widest text-neutral-500">NAV</p>
          <ul className="space-y-2">
            <li>Home</li>
            <li>Shop</li>
            <li>Product</li>
            <li>Contact</li>
          </ul>
        </div>
        <form
          className="md:col-span-2"
          onSubmit={(event) => {
            event.preventDefault();
            setNote(email ? "Thanks. This preview does not send email." : "");
          }}
        >
          <p className="mb-3 text-xs tracking-widest text-neutral-500">NEWSLETTER</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="w-full rounded border border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded bg-white px-4 text-sm text-neutral-950">
              Join
            </button>
          </div>
          {note ? <p className="mt-2 text-xs text-neutral-400">{note}</p> : null}
        </form>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-neutral-800 px-4 py-4 text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} SecureShop</p>
        <div className="flex gap-2">
          {["Visa", "Mastercard", "PayPal"].map((brand) => (
            <span key={brand} className="rounded border border-neutral-700 px-2 py-1 text-[10px] uppercase">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
