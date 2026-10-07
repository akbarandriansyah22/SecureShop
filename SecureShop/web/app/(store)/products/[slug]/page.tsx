import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { DetailTabs } from "@/components/products/detail-tabs";
import { PurchasePanel } from "@/components/products/purchase-panel";
import { ProductImage } from "@/components/ui/product-image";
import { Stars } from "@/components/ui/stars";
import { getProductBySlug, getProducts } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/money";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [result, session, catalog] = await Promise.all([getProductBySlug(slug), getSession(), getProducts()]);

  if (result.error !== null) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-red-700">{result.error}</p>;
  }

  const product = result.data;
  const more = catalog.error === null ? catalog.data.items.filter((item) => item.id !== product.id).slice(0, 4) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="mb-6 text-sm text-neutral-500">
        <Link href="/">Home</Link> <span className="px-1">›</span> <Link href="/search">Shop</Link>
      </p>
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square bg-neutral-100">
            <ProductImage src={product.image_url} name={product.name} />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="aspect-square bg-neutral-100">
                <ProductImage src={product.image_url} name={product.name} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <Stars />
          <h1 className="mt-2 font-serif text-4xl font-normal">{product.name}</h1>
          <p className="mt-3 text-xl">{formatPrice(product.price)}</p>
          <p className="mt-4 text-sm leading-6 text-neutral-600">{product.description || "No description yet."}</p>
          <p className="mt-2 text-sm text-neutral-500">
            Stock {product.stock} · SKU {product.sku || "—"}
          </p>
          <div className="mt-6">
            <PurchasePanel productId={product.id} loggedIn={Boolean(session)} />
          </div>
        </div>
      </div>
      <DetailTabs />
      <section className="mt-12">
        <h2 className="mb-6 font-serif text-3xl">More Products</h2>
        {more.length === 0 ? (
          <p className="text-sm text-neutral-500">No other products yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {more.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} loggedIn={Boolean(session)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
