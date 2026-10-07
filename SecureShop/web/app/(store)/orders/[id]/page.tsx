import { redirect } from "next/navigation";
import { CancelOrder } from "@/components/orders/cancel-order";
import { getSession } from "@/lib/auth";
import { getOrder } from "@/lib/shop";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

function notesText(notes: string | null | undefined): string {
  return notes ? notes : "—";
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const result = await getOrder(id);
  if (result.error !== null) {
    return <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{result.error}</p>;
  }

  const order = result.data;
  const canCancel = order.status === "pending" || order.status === "paid";

  return (
    <article className="mx-auto my-10 max-w-3xl space-y-2 border border-neutral-200 p-6">
      <h1 className="font-serif text-3xl font-normal">{order.order_number || `Order ${order.id}`}</h1>
      <p>Status: {order.status}</p>
      <p>Total: {formatPrice(order.total_amount)}</p>
      <p>Alamat: {order.shipping_address || "—"}</p>
      <p>Telepon: {order.shipping_phone || "—"}</p>
      <p>Pembayaran: {order.payment_method || "—"}</p>
      <p>Catatan: {notesText(order.notes)}</p>
      {canCancel ? <CancelOrder orderId={order.id} /> : null}
    </article>
  );
}
