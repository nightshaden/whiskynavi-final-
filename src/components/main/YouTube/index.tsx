const YouTube = () => {
  return (
    <section className="mt-25 mb-30 w-full max-w-screen-lg mx-auto">
      <h2 className="typo-bold-30 text-center text-white">YOUTUBE</h2>
      <div className="mt-10 px-4">
        <div className="w-full overflow-hidden rounded-2xl">
          <iframe
            className="block w-full aspect-video" // ← 비율은 iframe이 직접 가짐
            src="https://www.youtube.com/embed/1ZkbE6XfdDk?rel=0&modestbranding=1&playsinline=1"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{ border: 0 }}
          />
        </div>
      </div>
    </section>
  );
};

export default YouTube;
