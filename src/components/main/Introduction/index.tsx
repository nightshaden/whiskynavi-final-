const Introduction = () => {
  return (
    <section className="relative mt-15 h-screen w-full overflow-hidden">
      {/* 배경 이미지 레이어 (마스크로 위쪽을 숨기고 아래로 갈수록 보이게) */}
      <div
        className={[
          "pointer-events-none absolute inset-0",
          "bg-[url('/introduce.png')] bg-cover bg-center",
          "[mask-image:linear-gradient(to_bottom,transparent_0%,black_100%,black_100%)]",
          "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_100%,black_100%)]",
        ].join(" ")}
        aria-hidden
      />

      {/* 컨텐츠 */}
      <div className="relative mx-auto mt-20 flex h-full max-w-5xl flex-col items-center px-6 pt-24 text-center text-white">
        <h1 className="typo-bold-32 text-white">대한민국 최초의 독립병입 회사</h1>
        <p className="typo-medium-18 mt-26 leading-loose text-white">
          위스키내비(WhiskyNavi)는 한국 위스키 문화에 새로운 방향성과 경험을 제시하는 대한민국 위스키 독립병입
          회사입니다. <br />
        </p>
        <p className="typo-medium-18 mt-8 leading-loose text-white">
          2020년 설립 이래, 엄선된 원액과 캐스크를 기반으로 100여 종이 넘는 위스키를 국내에 선보여 왔습니다.
          위스키내비의 철학이 담긴 자체 병입 라인업과 더불어, 영국의 TSC, 일본의 사쿠라오(SAKURAO), 대만의 The
          Whiskyfind, 한국의 김창수 위스키 증류소 등 유수의 글로벌 파트너들과의 긴밀한 협력을 통해 다채롭고 특별한
          위스키 경험을 선사합니다.{" "}
        </p>
        <p className="typo-medium-18 mt-8 leading-loose text-white">
          끊임없는 도전정신과 품질을 바탕으로 대한민국 독립병입 시장의 새로운 항로를 개척해 나가겠습니다.
        </p>
      </div>
    </section>
  );
};

export default Introduction;
