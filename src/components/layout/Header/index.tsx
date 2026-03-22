"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { overlay } from "overlay-kit";
import { AUTH_NAV_LINKS, NAV_LINKS } from "./constants";
import DesktopAuthArea from "./DesktopAuthArea";
import MobileAuthSection from "./MobileAuthSection";
import UserMenuDropdown from "./UserMenuDropdown";
import { useScrolled } from "./useScrolled";

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isScrolled = useScrolled();
  const authAreaRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user?.roles?.includes("ROLE_ADMIN") ?? false;

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const openUserMenu = () => {
    const rect = authAreaRef.current?.getBoundingClientRect();
    overlay.open(({ isOpen, close }) =>
      isOpen ? (
        <UserMenuDropdown
          isAdmin={isAdmin}
          close={close}
          anchorRect={rect}
        />
      ) : null,
    );
  };

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

        <nav className="hidden items-center gap-12 lg:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`typo-bold-18 transition-colors ${
                pathname.startsWith(href)
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
          {session &&
            AUTH_NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`typo-bold-18 transition-colors ${
                  pathname.startsWith(href)
                    ? "text-white"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
        </nav>

        <div ref={authAreaRef} className="hidden items-center gap-4 lg:flex">
          {/* TODO: 다국어 지원 시 Globe 버튼 + overlay.open으로 언어 선택 드롭다운 구현 */}
          <DesktopAuthArea
            status={status}
            session={session}
            onOpenUserMenu={openUserMenu}
          />
        </div>

        <button
          type="button"
          onClick={() =>
            overlay.open(({ isOpen, close }) => (
              <Sheet
                open={isOpen}
                onOpenChange={(open) => {
                  if (!open) close();
                }}
              >
                <SheetContent
                  side="right"
                  className="w-4/5 border-white/10 bg-[#1d2429] sm:max-w-sm"
                >
                  <SheetHeader>
                    <SheetTitle className="text-white">메뉴</SheetTitle>
                  </SheetHeader>

                  <nav className="flex flex-1 flex-col gap-1 px-4">
                    {NAV_LINKS.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={close}
                        className={`typo-bold-16 rounded-lg px-3 py-3 transition-colors ${
                          pathname.startsWith(href)
                            ? "bg-white/10 text-white"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {label}
                      </Link>
                    ))}
                    {session &&
                      AUTH_NAV_LINKS.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={close}
                          className={`typo-bold-16 rounded-lg px-3 py-3 transition-colors ${
                            pathname.startsWith(href)
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {label}
                        </Link>
                      ))}
                  </nav>

                  <div className="border-t border-white/10 px-4 pt-4">
                    <MobileAuthSection
                      session={session}
                      isAdmin={isAdmin}
                      close={close}
                    />
                  </div>

                  {/* TODO: 다국어 지원 시 활성화
                <div className="border-t border-white/10 px-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 text-white/70">
                      <Globe size={18} />
                      <span className="typo-bold-14">언어 선택</span>
                    </div>
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => { changeLanguage(lang.code); close(); }}
                        className={`typo-regular-14 w-full rounded-lg py-2 pl-10 text-left transition-colors ${
                          currentLanguage === lang.code
                            ? "text-white"
                            : "text-white/60 hover:text-white/80"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div> */}
                </SheetContent>
              </Sheet>
            ))
          }
          className="cursor-pointer text-white lg:hidden"
          aria-label="메뉴 열기"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
