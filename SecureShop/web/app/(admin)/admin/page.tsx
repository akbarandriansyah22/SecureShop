import Link from "next/link";

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl space-y-3 px-4 py-10">
      <h1 className="font-serif text-4xl font-normal">Admin</h1>
      <ul className="space-y-1 text-sm">
        <li>
          <Link href="/admin/products" className="underline">
            Produk
          </Link>
        </li>
        <li>
          <Link href="/admin/categories" className="underline">
            Kategori
          </Link>
        </li>
        <li>
          <Link href="/admin/orders" className="underline">
            Order
          </Link>
        </li>
      </ul>
    </section>
  );
}
