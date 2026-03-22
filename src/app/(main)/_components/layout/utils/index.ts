import { Session } from "next-auth";

const isAdminUser = (session: Session | null) => {
  return session?.user?.roles?.includes("ROLE_ADMIN") ?? false;
};

const hasSession = (session: Session | null) => {
  return session !== null;
};

export { hasSession, isAdminUser };
