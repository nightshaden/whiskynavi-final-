"use client";

import Image from "next/image";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { IconGlobal } from "@/icons";

const Header = () => {
  const pathname = usePathname();
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
      className={`hidden lg:block fixed top-0 w-full py-3.5 px-10 z-50 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center max-w-screen-xl mx-auto w-full px-20">
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
          </ul>
          <div className="flex items-center gap-7">
            <Link
              href="/sign-in"
              className="cursor-pointer text-white typo-bold-20"
            >
              <p className="text-white typo-bold-20">Login</p>
            </Link>
            <IconGlobal size={24} />
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
    <Link className="block typo-bold-20 text-white py-3 px-2 hover" {...props}>
      {children}
    </Link>
  );
};
