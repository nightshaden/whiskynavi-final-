import BlacklistContent from "./_components/BlacklistContent";

interface BlacklistPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
  }>;
}

export default async function BlacklistPage({
  searchParams,
}: BlacklistPageProps) {
  const params = await searchParams;
  return <BlacklistContent searchParams={params} />;
}
