import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { getCategories, getProducts, getProductsByCategory, searchProducts } from "@/lib/api";
import { getSession } from "@/lib/auth";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const category = (params.category ?? "").trim();
  const [categories, session] = await Promise.all([getCategories(), getSession()]);
  const cats = categories.error === null ? categories.data : [];
  const current = cats.find((item) => String(item.id) === category);
  const title = current?.name || (q ? `Results for “${q}”` : "Shop");

  const result = category ? await getProductsByCategory(category) : q ? await searchProducts(q) : await getProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8 flex flex-col items-start justify-between gap-4 bg-neutral-100 px-6 py-10 md:flex-row md:items-center">
        <h1 className="font-serif text-4xl">Up to 50% off</h1>
        <Link href="/search" className="bg-neutral-950 px-6 py-3 text-sm text-white">
          Shop Now
        </Link>
      </section>
      <p className="mb-6 text-sm text-neutral-500">
        <Link href="/">Home</Link> <span className="px-1">›</span> Shop
      </p>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="space-y-6 text-sm">
          <div>
            <p className="mb-3 text-xs tracking-widest">CATEGORIES</p>
            <ul className="space-y-2">
              {cats.map((item) => (
                <li key={item.id}>
                  <Link href={`/search?category=${item.id}`} className={String(item.id) === category ? "underline" : ""}>
                    {item.name}
                  </Link>
                </li>
              ))}
              {cats.length === 0 ? <li className="text-neutral-500">No categories</li> : null}
            </ul>
          </div>
          <form action="/search" className="space-y-2">
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <label className="block text-xs tracking-widest">
              SEARCH
              <input name="q" defaultValue={q} className="mt-2 w-full border border-neutral-300 px-2 py-2 text-sm" />
            </label>
            <button type="submit" className="w-full bg-neutral-950 py-2 text-white">
              Apply
            </button>
          </form>
          <fieldset disabled className="space-y-2 text-neutral-400">
            <p className="text-xs tracking-widest text-neutral-500">PRICE</p>
            <input type="range" defaultValue={50} className="w-full" />
            <label className="flex gap-2">
              <input type="checkbox" /> In stock only
            </label>
          </fieldset>
        </aside>
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h1 className="font-serif text-4xl">{title}</h1>
            <select disabled className="border border-neutral-300 px-2 py-1 text-sm text-neutral-500" defaultValue="featured">
              <option value="featured">Sort: Featured</option>
            </select>
          </div>
          {categories.error !== null ? <p className="mb-3 text-sm text-red-700">{categories.error}</p> : null}
          {result.error !== null ? (
            <p className="text-sm text-red-700">{result.error}</p>
          ) : result.data.items.length === 0 ? (
            <p className="text-sm text-neutral-600">No products.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {result.data.items.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} loggedIn={Boolean(session)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
