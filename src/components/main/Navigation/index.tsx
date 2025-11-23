import Link from "next/link";

interface ItemProps {
  title: string;
  desc: string;
  path: string;
}

const Navigation = () => {
  const items: ItemProps[] = [
    {
      title: "OUR BRANDS",
      desc: "위스키내비에서 전개하고 있는 다양한 브랜드들을 만나보세요.",
      path: "/brands",
    },
    {
      title: "ARCHIVE",
      desc: "위스키내비에서 발매한 제품들을 둘러보세요.",
      path: "",
    },
    {
      title: "SHOP",
      desc: "전국 취급점에서 위스키내비 제품군을 만나보실 수 있습니다.",
      path: "",
    },
    {
      title: "COMMUNITY",
      desc: "위스키내비 커뮤니티에서 다양한 소식들을 만나보세요.",
      path: "",
    },
  ];
  return (
    <section className="mt-20 flex mx-15 justify-center align-center gap-11">
      {items.map((item) => (
        <Item key={item.title} {...item} />
      ))}
    </section>
  );
};

const Item = ({ title, desc, path }: ItemProps) => {
  return (
    <div
      className="
        flex flex-col items-center justify-center
        w-[280px] p-7
        rounded-[10px]
        border-[0.853px] border-white/20
        bg-[linear-gradient(180deg,rgba(46,54,60,0.50)_41.83%,rgba(110,113,116,0.50)_100%)]
        backdrop-blur-[11.00153636932373px]
        cursor-pointer
        transition-shadow duration-100 ease-in-out
        hover:border-white/40 hover:shadow-[0_0_20px_rgba(80,150,255,0.5)]
        hover:bg-[linear-gradient(180deg,rgba(46,54,60,0.50)_41.83%,rgba(110,113,116,0.50)_100%)]
      "
    >
      <h2 className="typo-bold-30 text-center text-white">{title}</h2>
      <p className="leading-loose typo-medium-18 text-center mt-7.5 text-[#C0BCBC]">
        {desc}
      </p>
      <Link
        href={path}
        className="inline-block mt-[30px] text-center typo-bold-20 text-white"
      >
        바로가기
      </Link>
    </div>
  );
};

export default Navigation;
