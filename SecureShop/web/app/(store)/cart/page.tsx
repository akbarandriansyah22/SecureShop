import Link from "next/link";
import { redirect } from "next/navigation";
import { RemoveItem } from "@/components/cart/remove-item";
import { ProductImage } from "@/components/ui/product-image";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { getCart } from "@/lib/shop";
import type { SqlNullString } from "@/lib/types";

function imageSrc(value: SqlNullString | string | undefined): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value.Valid ? value.String : undefined;
}

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");

  const result = await getCart();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm text-neutral-500">Shopping Cart</p>
      <ol className="mt-4 flex gap-6 text-sm">
        <li className="border-b border-neutral-950 pb-1">Cart</li>
        <li>
          <Link href="/checkout">Checkout</Link>
        </li>
        <li className="text-neutral-400">Complete</li>
      </ol>
      <h1 className="mt-6 font-serif text-4xl">Cart</h1>
      {result.error !== null ? (
        <p className="mt-6 text-sm text-red-700">{result.error}</p>
      ) : (result.data.items ?? []).length === 0 ? (
        <p className="mt-6 text-sm text-neutral-600">
          Your cart is empty. <Link href="/search" className="underline">Shop</Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {(result.data.items ?? []).map((item) => (
              <li key={item.id} className="grid grid-cols-[88px_1fr_auto] gap-4 py-4">
                <div className="h-24 w-full bg-neutral-100">
                  <ProductImage src={imageSrc(item.product.image_url)} name={item.product.name} />
                </div>
                <div>
                  <Link href={`/products/${item.product.slug}`} className="font-medium">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-neutral-500">Qty {item.quantity}</p>
                  <p className="text-sm">{formatPrice(item.price)}</p>
                </div>
                <div className="text-right">
                  <p>{formatPrice(item.price * item.quantity)}</p>
                  <RemoveItem itemId={item.id} />
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit border border-neutral-200 p-5">
            <h2 className="font-serif text-2xl">Summary</h2>
            <p className="mt-4 flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(result.data.total_price)}</span>
            </p>
            <Link href="/checkout" className="mt-6 block bg-neutral-950 py-3 text-center text-sm text-white">
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
