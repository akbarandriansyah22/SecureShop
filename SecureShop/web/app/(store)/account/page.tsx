import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

function roleLabel(roleId: number): string {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "customer";
  return String(roleId);
}

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <section className="mx-auto my-10 max-w-lg space-y-2 border border-neutral-200 p-6">
      <h1 className="font-serif text-3xl font-normal">Account</h1>
      <p>Email: {session.email}</p>
      <p>Nama: {session.full_name}</p>
      <p>Role: {roleLabel(session.role_id)}</p>
    </section>
  );
}
