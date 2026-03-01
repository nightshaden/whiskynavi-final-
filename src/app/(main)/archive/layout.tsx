import { api } from "@/apis/apis";
import { ArchiveSidebar } from "@/components/archive/ArchiveSidebar";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const bottleParams = await api.getBottleParams();

  return (
    <main className="mx-auto mt-50 w-full">
      <h1 className="typo-bold-40 text-center text-white">제품 목록</h1>
      {/* 메인 영역 */}
      <div className="mx-20 mt-15 flex gap-10">
        {/* 사이드바 영역 */}
        <ArchiveSidebar params={bottleParams} />
        {children}
      </div>
    </main>
  );
};

export default Layout;
