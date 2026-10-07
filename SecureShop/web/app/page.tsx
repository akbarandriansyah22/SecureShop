import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { ProductImage } from "@/components/ui/product-image";
import { getCategories, getProducts } from "@/lib/api";
import { getSession } from "@/lib/auth";

export default async function Page() {
  const [categories, products, session] = await Promise.all([
    getCategories(),
    getProducts(),
    getSession(),
  ]);
  const items = products.error === null ? products.data.items : [];
  const hero = items.slice(0, 2);

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="font-serif text-4xl font-normal leading-tight md:text-6xl">
            Listen to the amazing music sound.
          </h1>
          <p className="mt-4 max-w-md text-neutral-600">
            Experience music like you have never heard before.
          </p>
          <Link
            href="/search"
            className="mt-8 inline-block bg-neutral-950 px-6 py-3 text-sm text-white"
          >
            Shop Now
          </Link>
          <div className="mt-8 flex gap-2">
            <span className="h-2 w-2 rounded-full bg-neutral-950" />
            <span className="h-2 w-2 rounded-full bg-neutral-300" />
            <span className="h-2 w-2 rounded-full bg-neutral-300" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(hero.length
            ? hero
            : [{ id: 0, name: "SecureShop", image_url: undefined, slug: "" }]
          ).map((product) => (
            <div key={product.id} className="aspect-[3/4] bg-neutral-100">
              <ProductImage src={product.image_url} name={product.name} />
            </div>
          ))}
        </div>
      </section>

      {categories.error !== null ? (
        <p className="mx-auto max-w-6xl px-4 text-sm text-red-700">
          {categories.error}
        </p>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-6 font-serif text-3xl">Best Seller</h2>
        {products.error !== null ? (
          <p className="text-sm text-red-700">{products.error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-neutral-600">No products yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {items.slice(0, 10).map((product) => (
              <li key={product.id}>
                <ProductCard product={product} loggedIn={Boolean(session)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto my-10 flex max-w-6xl flex-col items-start justify-between gap-4 bg-neutral-100 px-6 py-12 md:flex-row md:items-center">
        <h2 className="font-serif text-4xl">Up to 50% off</h2>
        <Link
          href="/search"
          className="bg-neutral-950 px-6 py-3 text-sm text-white"
        >
          Shop Now
        </Link>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Free Shipping", "On orders that qualify"],
          ["Money-back", "30-day returns"],
          ["Secure Payment", "Checkout stays on this shop"],
          ["24/7 Support", "We are here to help"],
        ].map(([title, copy]) => (
          <div key={title}>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-neutral-500">{copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
