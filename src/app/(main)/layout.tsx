import Header from "@/app/(main)/_components/layout/Header";
import Footer from "@/app/(main)/_components/layout/Footer";

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
