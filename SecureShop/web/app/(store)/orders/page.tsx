import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getOrders } from "@/lib/shop";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");

  const result = await getOrders();
  if (result.error !== null) {
    return <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{result.error}</p>;
  }
  if (result.data.items.length === 0) {
    return (
      <section className="mx-auto max-w-6xl space-y-2 px-4 py-10">
        <h1 className="font-serif text-4xl font-normal">Orders</h1>
        <p className="text-sm text-neutral-600">Belum ada order.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-3 px-4 py-10">
      <h1 className="font-serif text-4xl font-normal">Orders</h1>
      <ul className="space-y-2">
        {result.data.items.map((order) => (
          <li key={order.id} className="rounded border border-neutral-200 bg-white p-4">
            <Link href={`/orders/${order.id}`} className="font-medium underline">
              {order.order_number || `#${order.id}`}
            </Link>
            <p className="text-sm">Status: {order.status}</p>
            <p className="text-sm">{formatPrice(order.total_amount)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
