"use client";

import Link from "next/link";
import { useState } from "react";

type SessionBits = { email: string; role_id: number } | null;

export function SiteHeader({ session, cartCount }: { session: SessionBits; cartCount: number }) {
  const [promo, setPromo] = useState(true);
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white">
      {promo ? (
        <div className="flex items-center justify-center gap-3 bg-neutral-950 px-4 py-2 text-center text-xs text-white">
          <p>
            30% OFF STOREWIDE — LIMITED TIME!{" "}
            <Link href="/search" className="underline">
              Shop Now
            </Link>
          </p>
          <button type="button" className="text-base leading-none" aria-label="Close promo" onClick={() => setPromo(false)}>
            ×
          </button>
        </div>
      ) : null}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <button type="button" className="text-xl md:hidden" aria-label="Menu" onClick={() => setOpen((value) => !value)}>
            ☰
          </button>
          <Link href="/" className="font-serif text-2xl tracking-tight">
            SecureShop.
          </Link>
        </div>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link href="/">Home</Link>
          <Link href="/search">Shop</Link>
          <Link href="/search">Product</Link>
          <Link href="#contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/search" aria-label="Search">
            <SearchIcon />
          </Link>
          <div className="relative">
            <button type="button" aria-label="Account" onClick={() => setAccountOpen((value) => !value)}>
              <UserIcon />
            </button>
            {accountOpen ? (
              <div className="absolute right-0 mt-2 w-48 border border-neutral-200 bg-white p-3 text-sm shadow-sm">
                {session ? (
                  <div className="space-y-2">
                    <p className="truncate text-neutral-500">{session.email}</p>
                    <Link href="/account" className="block">
                      Account
                    </Link>
                    <Link href="/orders" className="block">
                      Orders
                    </Link>
                    {session.role_id === 1 ? (
                      <Link href="/admin" className="block">
                        Admin
                      </Link>
                    ) : null}
                    <form action="/api/auth/logout" method="post">
                      <button type="submit">Logout</button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" className="block">
                      Login
                    </Link>
                    <Link href="/register" className="block">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <Link href="/cart" className="relative" aria-label="Cart">
            <CartIcon />
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-950 px-1 text-[10px] text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
      {open ? (
        <nav className="flex flex-col gap-3 border-t border-neutral-200 px-4 py-4 text-sm md:hidden">
          <Link href="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link href="/search" onClick={() => setOpen(false)}>
            Shop
          </Link>
          <Link href="/search" onClick={() => setOpen(false)}>
            Product
          </Link>
          <Link href="#contact" onClick={() => setOpen(false)}>
            Contact
          </Link>
          {session ? (
            <>
              <Link href="/orders" onClick={() => setOpen(false)}>
                Orders
              </Link>
              {session.role_id === 1 ? (
                <Link href="/admin" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              ) : null}
            </>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.5-3 3.8-4.5 7-4.5S17.5 16 19 19" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 7h15l-1.5 9h-12z" />
      <path d="M6 7L5 4H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}
