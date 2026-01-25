import ReservationsContent from "./_components/ReservationsContent";

interface ReservationsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
    brand?: string;
    status?: string;
  }>;
}

export default async function ReservationsPage({
  searchParams,
}: ReservationsPageProps) {
  const params = await searchParams;
  return <ReservationsContent searchParams={params} />;
}
