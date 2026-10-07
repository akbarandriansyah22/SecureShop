import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role_id !== 1) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-red-800">Forbidden</p>;
  }
  return children;
}
