import { api } from "@/apis/apis";
import { ArchiveSidebar } from "@/app/(main)/archive/_components/ArchiveSidebar";
import ListHero from "./_components/ListHero";
import MobileSearchBar from "./_components/MobileSearchBar";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const bottleParams = await api.getBottleParams();

  return (
    <div className="min-h-screen bg-[#1d2429]">
      <ListHero />
      <MobileSearchBar />

      <div className="mx-auto flex max-w-[1440px] px-4 pt-4 pb-12 lg:px-10 lg:pt-2">
        <ArchiveSidebar params={bottleParams} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
