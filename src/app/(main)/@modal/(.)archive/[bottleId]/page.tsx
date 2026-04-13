import { getApiBottlesId } from "@/apis/generated/api";
import BottleDetailModal from "./BottleDetailModal";

const Page = async ({ params }: { params: Promise<{ bottleId: string }> }) => {
  const { bottleId: bottleIdParam } = await params;
  const bottleId = Number(bottleIdParam);
  const { data: bottle } = await getApiBottlesId(bottleId);

  return <BottleDetailModal bottle={bottle} />;
};

export default Page;
