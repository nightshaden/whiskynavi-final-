import type { Session } from "next-auth";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { UserAvatar, UserName } from "./shared";

interface DesktopAuthAreaProps {
  status: string;
  session: Session | null;
  onOpenUserMenu: () => void;
}

export default function DesktopAuthArea({
  status,
  session,
  onOpenUserMenu,
}: DesktopAuthAreaProps) {
  if (status === "loading") {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
    );
  }

  if (!session) {
    return (
      <Link
        href="/sign-in"
        className="typo-bold-14 border border-white/30 px-5 py-1.5 text-white transition-colors hover:border-white/50"
      >
        로그인
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenUserMenu}
      className="group flex cursor-pointer items-center gap-3"
    >
      <UserAvatar />
      <div className="flex flex-col items-start">
        <UserName name={session.user?.name} />
        <span className="typo-regular-12 flex items-center gap-1 text-white/60 transition-colors group-hover:text-white/80">
          메뉴
          <ChevronDown size={10} />
        </span>
      </div>
    </button>
  );
}
