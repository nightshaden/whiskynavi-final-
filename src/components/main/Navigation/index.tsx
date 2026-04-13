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
      path: "/brand",
    },
    {
      title: "ARCHIVE",
      desc: "위스키내비에서 발매한 제품들을 둘러보세요.",
      path: "/archive",
    },
    {
      title: "SHOP",
      desc: "전국 취급점에서 위스키내비 제품군을 만나보실 수 있습니다.",
      path: "/reservation",
    },
  ];
  return (
    <section className="align-center mx-15 mt-20 flex justify-center gap-11">
      {items.map((item) => (
        <Item key={item.title} {...item} />
      ))}
    </section>
  );
};

const Item = ({ title, desc, path }: ItemProps) => {
  return (
    <div className="flex w-[280px] cursor-pointer flex-col items-center justify-center rounded-[10px] border-[0.853px] border-white/20 bg-[linear-gradient(180deg,rgba(46,54,60,0.50)_41.83%,rgba(110,113,116,0.50)_100%)] p-7 backdrop-blur-[11.00153636932373px] transition-shadow duration-100 ease-in-out hover:border-white/40 hover:bg-[linear-gradient(180deg,rgba(46,54,60,0.50)_41.83%,rgba(110,113,116,0.50)_100%)] hover:shadow-[0_0_20px_rgba(80,150,255,0.5)]">
      <h2 className="typo-bold-30 text-center text-white">{title}</h2>
      <p className="typo-medium-18 mt-7.5 text-center leading-loose text-[#C0BCBC]">{desc}</p>
      <Link href={path} className="typo-bold-20 mt-[30px] inline-block text-center text-white">
        바로가기
      </Link>
    </div>
  );
};

export default Navigation;
