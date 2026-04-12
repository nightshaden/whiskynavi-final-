import { getApiAdminKvStore } from "@/apis/generated/api";
import { ApiError } from "@/apis/errors";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { YOUTUBE_KEY } from "./constants";
import YoutubeContent from "./_components/YoutubeContent";

export default async function YoutubePage() {
  const token = await getAuthToken();
  let embedUrl = "";

  try {
    const res = await getApiAdminKvStore(YOUTUBE_KEY, withToken(token));
    embedUrl = res.data.value ?? "";
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      // key가 아직 없는 경우 → 빈 값은 정상
    } else {
      throw error;
    }
  }

  return <YoutubeContent defaultEmbedUrl={embedUrl} />;
}
