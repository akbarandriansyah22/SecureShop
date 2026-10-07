import Link from "next/link";
import { AddToCart } from "@/components/cart/add-to-cart";
import { ProductImage } from "@/components/ui/product-image";
import { Stars } from "@/components/ui/stars";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductCard({ product, loggedIn }: { product: Product; loggedIn: boolean }) {
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <Link href={`/products/${product.slug}`} className="block h-full">
          <ProductImage src={product.image_url} name={product.name} />
        </Link>
        <button type="button" aria-label="Wishlist" className="absolute right-3 top-3 text-lg">
          ♡
        </button>
        <div className="absolute inset-x-3 bottom-3 hidden group-hover:block">
          {loggedIn ? (
            <AddToCart productId={product.id} label="Add to cart" className="w-full rounded-none bg-neutral-950 py-2 text-sm text-white" />
          ) : (
            <Link href="/login" className="block bg-neutral-950 py-2 text-center text-sm text-white">
              Add to cart
            </Link>
          )}
        </div>
      </div>
      <Link href={`/products/${product.slug}`} className="mt-3 block text-sm">
        {product.name}
      </Link>
      <p className="text-sm">{formatPrice(product.price)}</p>
      <Stars />
    </article>
  );
}
