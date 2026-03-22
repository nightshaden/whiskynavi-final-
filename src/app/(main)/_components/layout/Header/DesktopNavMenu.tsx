"use client";

import { Session } from "next-auth";
import Link from "next/link";
import { overlay } from "overlay-kit";
import { FC, useRef } from "react";
import { hasSession, isAdminUser } from "../utils";
import { AUTH_NAV_LINKS, NAV_LINKS } from "./constants";
import DesktopAuthArea from "./DesktopAuthArea";
import UserMenuDropdown from "./UserMenuDropdown";

interface Props {
  session: Session | null;
  pathname: string;
}

const DesktopNavMenu: FC<Props> = ({ session, pathname }) => {
  const authAreaRef = useRef<HTMLDivElement>(null);

  const openUserMenu = () => {
    const rect = authAreaRef.current?.getBoundingClientRect();
    overlay.open(({ isOpen, close }) =>
      isOpen ? (
        <UserMenuDropdown
          isAdminUser={isAdminUser(session)}
          close={close}
          anchorRect={rect}
        />
      ) : null,
    );
  };

  return (
    <>
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
        {hasSession(session) &&
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
        <DesktopAuthArea onOpenUserMenu={openUserMenu} />
      </div>
    </>
  );
};

export default DesktopNavMenu;
