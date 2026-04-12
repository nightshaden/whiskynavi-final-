import Footer from "@/app/(main)/_components/layout/Footer";
import Header from "@/app/(main)/_components/layout/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
