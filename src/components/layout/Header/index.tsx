import Image from "next/image";
import Link, { type LinkProps } from "next/link";
import type { FC } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="hidden lg:block fixed top-0 w-full  py-8 px-10 z-1">
      <div className="flex justify-between items-center max-w-screen-lg mx-auto w-full px-20">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={186} height={40} />
        </Link>
        <nav className="flex items-center gap-[50px]">
          <ul className="flex items-center gap-[50px]">
            <li>
              <NavLink href="/about">회사소개</NavLink>
            </li>
            <li>
              <NavLink href="/brand">브랜드</NavLink>
            </li>
            <li>
              <NavLink href="/archive">아카이브</NavLink>
            </li>
            <li>
              <NavLink href="/find">매장찾기</NavLink>
            </li>
            <li>
              <NavLink href="/community">커뮤니티</NavLink>
            </li>
          </ul>
          <Button
            variant="outline"
            size="lg"
            className="cursor-pointer bg-transparent border-white text-white"
          >
            <p className="text-white typo-bold-20">Login</p>
          </Button>
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
