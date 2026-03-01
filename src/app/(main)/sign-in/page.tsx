import Image from "next/image";
import { SignInForm } from "./SignInForm";

const Page = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="flex w-full max-w-[400px] flex-col items-center">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Image
            src="/whiskynavi-logo.png"
            alt="whiskynavi-logo"
            width={80}
            height={101}
          />
        </div>

        <SignInForm />
      </section>
    </main>
  );
};

export default Page;
