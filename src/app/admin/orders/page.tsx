import { redirect } from "next/navigation";
import type { AdminOrdersSearchParams } from "./_components/AdminOrdersContent";

interface AdminOrdersPageProps {
  searchParams: Promise<AdminOrdersSearchParams>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const next = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) next.set(key, value);
  });

  const queryString = next.toString();
  redirect(queryString ? `/admin/general-item-orders?${queryString}` : "/admin/general-item-orders");
}
