import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/orders/checkout-form";
import { getSession } from "@/lib/auth";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <CheckoutForm />;
}
