import {
  getApiUsersBusinessesPickupReservationsNoticesStatuses,
  getApiUsersBusinessesReservationDeliveries,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import PickupReservationsContent from "./_components/PickupReservationsContent";

interface PickupReservationsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

async function getOptionalData<T>(request: Promise<{ data: T }>): Promise<T | undefined> {
  try {
    const response = await request;
    return response.data;
  } catch {
    return undefined;
  }
}

export default async function PickupReservationsPage({ searchParams }: PickupReservationsPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();

  const [noticesRes, deliveriesData] = await Promise.all([
    getApiUsersBusinessesPickupReservationsNoticesStatuses(
      {
        page: params.page ? Number(params.page) - 1 : 0,
        size: params.limit ? Number(params.limit) : 20,
      },
      withToken(token),
    ),
    getOptionalData(getApiUsersBusinessesReservationDeliveries(undefined, withToken(token))),
  ]);

  return (
    <PickupReservationsContent
      searchParams={params}
      notices={noticesRes.data.content ?? []}
      totalElements={noticesRes.data.totalElements ?? 0}
      deliveries={deliveriesData ?? []}
    />
  );
}
