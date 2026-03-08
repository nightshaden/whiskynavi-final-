export default function HeroSkeleton() {
  return (
    <div className="relative h-[calc(100vh-80px)] animate-pulse bg-[#1d2429]">
      <div className="absolute inset-0 bg-gray-800/50" />
      <div className="relative flex h-full items-center justify-center px-4 md:px-6">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4">
            <div className="h-8 w-64 rounded bg-gray-700 md:h-12 md:w-96" />
            <div className="h-5 w-48 rounded bg-gray-700/60 md:h-6 md:w-72" />
            <div className="mt-2 h-10 w-32 rounded bg-gray-700/40 md:h-12 md:w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
