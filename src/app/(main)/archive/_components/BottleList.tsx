import {
  getApiBottles,
  type GetApiBottlesParams,
} from "@/apis/generated/api";
import BottleCard from "../../_components/BottleCard";
import type { SearchParams } from "../_utils";
import { buildPageUrl } from "../_utils";
import Pagination from "./Pagination";

interface BottleListProps {
  params: SearchParams;
}

export default async function BottleList({ params }: BottleListProps) {
  const currentPage = Math.max(Number(params.page) || 1, 1);
  const { sort, ...rest } = params;

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
    <>
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
    </>
  );
}
