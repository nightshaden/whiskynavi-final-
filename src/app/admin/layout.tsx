import { redirect } from "next/navigation";

import { getAuthToken } from "@/lib/auth";

import AdminLayoutClient from "./_components/AdminLayoutClient";

export const metadata = {
  title: "관리자",
  description: "위스키내비 관리자 페이지",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAuthToken();

  if (!token) {
    redirect("/");
  }

  return (
    <main>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </main>
  );
}
