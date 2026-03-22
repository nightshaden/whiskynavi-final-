"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DesktopNavMenu from "./DesktopNavMenu";
import MobileNavMenu from "./MobileNavMenu";
import { useScrolled } from "./useScrolled";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isScrolled = useScrolled();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b border-white/10 backdrop-blur-lg transition-all duration-300 ${
        isScrolled ? "bg-[#0f1419]/70 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="group flex h-8 items-center lg:h-10">
          <Image
            src="/logo.png"
            alt="WHISKYNAVI"
            width={150}
            height={40}
            className="h-full w-auto object-contain transition-opacity group-hover:opacity-90"
            priority
          />
        </Link>

        <DesktopNavMenu session={session} pathname={pathname} />
        <MobileNavMenu session={session} pathname={pathname} />
      </div>
    </header>
  );
}
