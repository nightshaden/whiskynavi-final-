import UsersContent from "./_components/UsersContent";

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
    memberType?: string;
    navi?: string;
    tales?: string;
    sortBy?: string;
    order?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  return <UsersContent searchParams={params} />;
}
