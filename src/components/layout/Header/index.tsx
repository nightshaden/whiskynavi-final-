"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { type FC, useEffect, useState } from "react";

const Header = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기 상태 체크

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // /admin 경로에서는 Header를 렌더링하지 않음
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 z-50 hidden w-full px-10 py-3.5 transition-all duration-300 lg:block ${
        isScrolled ? "backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-20">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={186} height={40} />
        </Link>
        <nav className="flex items-center gap-[50px]">
          <ul className="flex items-center gap-[50px]">
            <li>
              <NavLink href="/brand">브랜드</NavLink>
            </li>
            <li>
              <NavLink href="/archive">아카이브</NavLink>
            </li>
            <li>
              <NavLink href="/my-page">마이 페이지</NavLink>
            </li>
          </ul>
          <div className="flex items-center gap-7">
            {status === "loading" ? (
              <span className="typo-bold-20 text-white opacity-50">...</span>
            ) : session ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="typo-bold-20 cursor-pointer text-white"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="typo-bold-20 cursor-pointer text-white"
              >
                <p className="typo-bold-20 text-white">Login</p>
              </Link>
            )}
            {session?.user.roles?.includes("ROLE_ADMIN") && (
              <Link
                href="/admin"
                className="typo-bold-20 cursor-pointer text-white"
              >
                <p className="typo-bold-20 text-white">Admin</p>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

interface FooterLinkProps extends LinkProps {
  children: React.ReactNode;
}

const NavLink: FC<FooterLinkProps> = ({ children, ...props }) => {
  return (
    <Link className="typo-bold-20 hover block px-2 py-3 text-white" {...props}>
      {children}
    </Link>
  );
};
