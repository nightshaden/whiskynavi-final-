import {
  type BottleAdminResponse,
  getApiAdminBottles,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import NoticeCreateContent from "./_components/NoticeCreateContent";

export default async function NoticeCreatePage() {
  const token = await getAuthToken();

  let bottles: BottleAdminResponse[] = [];
  try {
    const res = await getApiAdminBottles(
      { filters: { reservationStatus: "NO_RESERVATION", pageSize: 1000 } },
      withToken(token),
    );
    bottles = res.data.content ?? [];
  } catch {
    /* empty */
  }

  return <NoticeCreateContent bottles={bottles} />;
}
