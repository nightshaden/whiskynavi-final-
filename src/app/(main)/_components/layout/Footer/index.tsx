import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-6 border-t border-white/10 bg-[#1d2429] py-6 md:mt-12 md:py-8">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-10">
        <div className="mb-4 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 md:mb-6 md:gap-6 md:pb-6 lg:flex-row">
          <div>
            <p className="mb-1 text-base text-white md:mb-2 md:text-xl">
              WHISKYNAVI
            </p>
            <p className="text-[10px] text-gray-400 md:text-xs">
              독립병입의 새로운 기준
            </p>
          </div>
          <nav className="flex flex-wrap gap-3 text-xs text-gray-400 md:gap-4 md:text-sm">
            <Link href="/brand" className="transition-colors hover:text-white">
              브랜드
            </Link>
            <Link
              href="/archive"
              className="transition-colors hover:text-white"
            >
              아카이브
            </Link>
          </nav>
        </div>

        {/* Desktop: 2 rows - Company info on left, CS on right */}
        <div className="hidden space-y-2 text-xs text-gray-500 md:block">
          <div className="flex items-center justify-between">
            <span>사업자등록번호: 472-81-02973 | 대표자: 천관호</span>
            <span>고객센터: 0000-0000-0000</span>
          </div>
          <div className="flex items-center justify-between">
            <span>주소: 경기도 성남시 중원구 둔촌대로 537, 에이동 208호</span>
            <span className="absolute left-1/2 -translate-x-1/2">
              © 2025 WHISKYNAVI. All rights reserved.
            </span>
            <span>이메일: contact@whiskynavi.com</span>
          </div>
        </div>

        {/* Mobile: Compact with | separator */}
        <div className="text-[10px] text-gray-500 md:hidden">
          <p className="mb-1">사업자등록번호: 472-81-02973 | 대표자: 천관호</p>
          <p className="mb-1">
            주소: 경기도 성남시 중원구 둔촌대로 537, 에이동 208호
          </p>
          <p className="mb-1">
            고객센터: 0000-0000-0000 | 이메일: contact@whiskynavi.com
          </p>
          <p>© 2025 WHISKYNAVI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
