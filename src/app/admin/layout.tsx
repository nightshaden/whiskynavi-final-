import AdminLayoutClient from "./_components/AdminLayoutClient";

export const metadata = {
  title: "관리자",
  description: "위스키내비 관리자 페이지",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main><AdminLayoutClient>{children}</AdminLayoutClient></main>;
}
