import { User } from "lucide-react";
import { signOut } from "next-auth/react";

export function UserAvatar({ size = 20 }: { size?: number }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-colors group-hover:bg-white/15">
      <User size={size} className="text-white" />
    </div>
  );
}

export function UserName({ name }: { name: string | null | undefined }) {
  return <span className="typo-bold-14 text-white">{name ?? "사용자"}님</span>;
}

export function LogoutButton({
  className,
  onBeforeSignOut,
}: {
  className: string;
  onBeforeSignOut?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onBeforeSignOut?.();
        signOut({ callbackUrl: "/" });
      }}
      className={className}
    >
      로그아웃
    </button>
  );
}
