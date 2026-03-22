import { getApiBottlesParameters } from "@/apis/generated/api";
import { Suspense } from "react";
import ArchiveClientShell from "./_components/ArchiveClientShell";
import BottleList from "./_components/BottleList";
import BottleListSkeleton from "./_components/BottleListSkeleton";
import ListHero from "./_components/ListHero";
import { SearchParams } from "./_utils";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const bottleParams = await getApiBottlesParameters();
  const suspenseKey = JSON.stringify(params);

  return (
    <div className="min-h-screen bg-[#1d2429]">
      <ListHero />
      <ArchiveClientShell bottleParams={bottleParams.data}>
        <Suspense key={suspenseKey} fallback={<BottleListSkeleton />}>
          <BottleList params={params} />
        </Suspense>
      </ArchiveClientShell>
    </div>
  );
};

export default Page;
