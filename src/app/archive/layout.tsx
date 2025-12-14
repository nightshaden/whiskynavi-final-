import { api } from "@/apis/apis";
import { ArchiveSidebar } from "@/components/archive/ArchiveSidebar";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const bottleParams = await api.getBottleParams();

  return (
    <main className="mt-50 w-full mx-auto">
      <h1 className="typo-bold-40 text-center text-white">아카이브</h1>
      {/* 메인 영역 */}
      <div className="flex gap-20 mx-[110px]">
        {/* 사이드바 영역 */}
        <ArchiveSidebar params={bottleParams} />

        {children}
      </div>
    </main>
  );
};

export default Layout;
