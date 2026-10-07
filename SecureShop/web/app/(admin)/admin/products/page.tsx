import { CreateProductForm, ProductRowActions } from "@/components/admin/product-actions";
import { getProducts } from "@/lib/api";

export default async function Page() {
  const products = await getProducts();

  return (
    <section className="mx-auto max-w-6xl space-y-4 px-4 py-10">
      <h1 className="font-serif text-4xl font-normal">Products</h1>
      <CreateProductForm />
      {products.error !== null ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{products.error}</p>
      ) : products.data.items.length === 0 ? (
        <p className="text-sm text-neutral-600">Belum ada produk.</p>
      ) : (
        <ul className="space-y-2">
          {products.data.items.map((product) => (
            <li key={product.id} className="rounded border border-neutral-200 bg-white p-4">
              <p className="font-medium">
                {product.name} <span className="text-sm text-neutral-600">/{product.slug}</span>
              </p>
              <p className="text-sm text-neutral-600">
                Stok {product.stock} · {product.is_active ? "aktif" : "nonaktif"}
              </p>
              <ProductRowActions id={product.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
