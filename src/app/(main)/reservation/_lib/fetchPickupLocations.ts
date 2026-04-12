import type { PickupLocationResponse } from "@/apis/generated/api";
import { getApiUsersBusinessesPickupLocations } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";

export async function fetchPickupLocations(): Promise<
  PickupLocationResponse[]
> {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const res = await getApiUsersBusinessesPickupLocations(
      { size: 100 },
      withToken(token),
    );
    return res.data?.content ?? [];
  } catch {
    return [];
  }
}
