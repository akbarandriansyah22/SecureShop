import { OrderStatusForm } from "@/components/admin/order-status";
import { getAdminOrders } from "@/lib/shop";

export default async function Page() {
  const orders = await getAdminOrders();

  return (
    <section className="mx-auto max-w-6xl space-y-3 px-4 py-10">
      <h1 className="font-serif text-4xl font-normal">Orders</h1>
      {orders.error !== null ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{orders.error}</p>
      ) : orders.data.items.length === 0 ? (
        <p className="text-sm text-neutral-600">Belum ada order.</p>
      ) : (
        <ul className="space-y-2">
          {orders.data.items.map((order) => (
            <li key={order.id} className="space-y-2 rounded border border-neutral-200 bg-white p-4">
              <p className="font-medium">{order.order_number || `#${order.id}`}</p>
              <p className="text-sm text-neutral-600">Status sekarang: {order.status}</p>
              <OrderStatusForm orderId={order.id} status={order.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
