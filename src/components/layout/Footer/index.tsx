import Image from "next/image";
import Link, { type LinkProps } from "next/link";
import type { FC } from "react";
import { IconInstagram, IconYoutube } from "@/icons";

const Footer = () => {
  return (
    <footer className="hidden lg:block px-10 pt-6 pb-12">
      <div className="flex flex-col gap-12 align-center justify-center">
        <div className="flex justify-between items-center">
          <Image src="/footer-logo.png" alt="logo" width={158} height={33} />
          <ul className="flex gap-4 mx-4">
            <li>
              <FooterLink href="/notice">Notice</FooterLink>
            </li>
            <li>
              <FooterLink href="/faq">FAQ</FooterLink>
            </li>
            <li>
              <FooterLink href="/qna">Q&A</FooterLink>
            </li>
            <li>
              <FooterLink href="/terms-of-service">사이트이용약관</FooterLink>
            </li>
            <li>
              <FooterLink href="/privacy-policy">개인정보처리방침</FooterLink>
            </li>
          </ul>
          <div className="flex gap-4 mr-10">
            <IconYoutube size={24} fill="white" />
            <IconInstagram size={24} fill="white" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center typo-regular-14 text-white">
          <p>
            사업자등록번호: 472-81-02973 사업자정보확인 | 대표자: 천관호 |
            법인등록번호: 131111-0725358 | 주소: 경기도 성남시 중원구 둔촌대로
            537, 에이동 208호(상대원동, 쌍용타용IT트윈타워 A동) |
            고객센터: 0000-0000-0000 | 이메일: contact@whiskynavi.com
          </p>
          <p>whiskynavi @ 2025. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

interface FooterLinkProps extends LinkProps {
  children: React.ReactNode;
}

const FooterLink: FC<FooterLinkProps> = ({ children, ...props }) => {
  return (
    <Link className="block typo-medium-16 text-white py-3 px-2" {...props}>
      {children}
    </Link>
  );
};
