import { getApiAdminItemsId } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import GeneralItemDetailContent from "./_components/GeneralItemDetailContent";

interface GeneralItemDetailPageProps {
  params: Promise<{
    itemId: string;
  }>;
}

export default async function GeneralItemDetailPage({ params }: GeneralItemDetailPageProps) {
  const { itemId } = await params;
  const id = Number(itemId);

  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const token = await getAuthToken();
  const response = await getApiAdminItemsId(id, withToken(token));

  return <GeneralItemDetailContent item={response.data} />;
}
