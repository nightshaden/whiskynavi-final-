import Hero from "@/components/main/Hero";
import Introduction from "@/components/main/Introduction";
import Navigation from "@/components/main/Navigation";
import YouTube from "@/components/main/YouTube";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-between ">
      <Hero />
      <Introduction />
      <Navigation />
      <YouTube />
    </main>
  );
}
