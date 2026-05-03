import { Session } from "next-auth";

const isAdminUser = (session: Session | null) => {
  return session?.user?.roles?.includes("ROLE_ADMIN") ?? false;
};

const isBusinessUser = (session: Session | null) => {
  return session?.user?.roles?.includes("ROLE_BUSINESS") ?? false;
};

const hasSession = (session: Session | null) => {
  return session !== null;
};

export { hasSession, isAdminUser, isBusinessUser };
