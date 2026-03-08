import {
  getApiBottles,
  getApiBottlesParameters,
  type GetApiBottlesParams,
} from "@/apis/generated/api";
import BottleCard from "../_components/BottleCard";
import { ArchiveSidebar } from "./_components/ArchiveSidebar";
import ListHero from "./_components/ListHero";
import MobileSearchBar from "./_components/MobileSearchBar";
import Pagination from "./_components/Pagination";
import { buildPageUrl, SearchParams } from "./_utils";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const currentPage = params.page ? Number(params.page) : 1;
  const { sort, ...rest } = params;
  const bottleParams = await getApiBottlesParameters();
  const { data: bottlesResponse } = await getApiBottles({
    filters: {
      ...rest,
      pageNumber: currentPage - 1,
      pageSize: 12,
    } as GetApiBottlesParams["filters"],
    ...(sort ? { sort } : {}),
  });

  const totalPages = bottlesResponse.totalPages ?? 0;

  return (
    <div className="min-h-screen bg-[#1d2429]">
      <ListHero />
      <MobileSearchBar />
      <div className="mx-auto flex max-w-[1440px] px-4 pt-4 pb-12 lg:px-10 lg:pt-2">
        <ArchiveSidebar params={bottleParams.data} />
        <main className="flex min-h-[calc(100vh-14rem)] flex-1 flex-col">
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
            {bottlesResponse.content?.map((bottle) => (
              <BottleCard key={bottle.id} bottle={bottle} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildPageUrl={(page) => buildPageUrl(params, page)}
          />
        </main>
      </div>
    </div>
  );
};

export default Page;
