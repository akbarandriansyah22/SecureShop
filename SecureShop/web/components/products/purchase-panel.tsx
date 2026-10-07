"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCart } from "@/components/cart/add-to-cart";

const COLORS = ["#1a1a1a", "#c4a484", "#d6d3d1"];
const SIZES = ["S", "M", "L"];

export function PurchasePanel({ productId, loggedIn }: { productId: number; loggedIn: boolean }) {
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState("M");
  const [wish, setWish] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs tracking-widest text-neutral-500">COLOR</p>
        <div className="flex gap-2">
          {COLORS.map((value, index) => (
            <button
              key={value}
              type="button"
              aria-label={`Color ${index + 1}`}
              onClick={() => setColor(index)}
              className={`h-7 w-7 rounded-full border ${color === index ? "ring-2 ring-neutral-950 ring-offset-2" : "border-neutral-300"}`}
              style={{ background: value }}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs tracking-widest text-neutral-500">SIZE</p>
        <div className="flex gap-2">
          {SIZES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSize(value)}
              className={`h-10 w-10 border text-sm ${size === value ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300"}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-neutral-300">
          <button type="button" className="px-3 py-2" onClick={() => setQty((value) => Math.max(1, value - 1))}>
            −
          </button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button type="button" className="px-3 py-2" onClick={() => setQty((value) => value + 1)}>
            +
          </button>
        </div>
        {loggedIn ? (
          <AddToCart productId={productId} quantity={qty} className="flex-1 bg-neutral-950 py-3 text-sm text-white disabled:opacity-60" />
        ) : (
          <Link href="/login" className="flex-1 bg-neutral-950 py-3 text-center text-sm text-white">
            Add to cart
          </Link>
        )}
        <button type="button" className="border border-neutral-300 px-3 py-3" onClick={() => setWish((value) => !value)} aria-label="Wishlist">
          {wish ? "♥" : "♡"}
        </button>
      </div>
      <p className="text-xs text-neutral-500">Color and size are display only.</p>
    </div>
  );
}
