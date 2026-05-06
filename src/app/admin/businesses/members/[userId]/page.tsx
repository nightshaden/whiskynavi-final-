import { getApiAdminBusinessesMembersUserid } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import BusinessMemberDetailContent from "./_components/BusinessMemberDetailContent";

const DOCUMENT_DOWNLOAD_VALID_MS = 9 * 60 * 1000 + 30 * 1000;

interface BusinessMemberDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default async function BusinessMemberDetailPage({
  params,
}: BusinessMemberDetailPageProps) {
  const { userId } = await params;
  const token = await getAuthToken();

  let res;
  try {
    res = await getApiAdminBusinessesMembersUserid(
      Number(userId),
      withToken(token),
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[404]")) {
      notFound();
    }
    throw error;
  }

  // 사업자등록증 다운로드 URL은 상세 조회 API 응답 완료 시점을 기준으로 9분 30초 동안 유효 시간을 안내한다.
  const documentDownloadExpiresAt = res.data.documentDownloadUrl
    ? new Date(Date.now() + DOCUMENT_DOWNLOAD_VALID_MS).toISOString()
    : undefined;

  return (
    <BusinessMemberDetailContent
      member={res.data}
      documentDownloadExpiresAt={documentDownloadExpiresAt}
      documentDownloadInitialRemainingSeconds={documentDownloadExpiresAt ? DOCUMENT_DOWNLOAD_VALID_MS / 1000 : undefined}
    />
  );
}
