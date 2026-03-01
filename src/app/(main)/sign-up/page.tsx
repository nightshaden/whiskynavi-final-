import { SignUpForm } from "./SignUpForm";

const Page = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-[520px] rounded-2xl bg-white px-8 py-10 md:px-12">
        {/* Title */}
        <h1 className="typo-bold-24 mb-8 text-center text-black">회원가입</h1>
        <SignUpForm />
      </section>
    </main>
  );
};

export default Page;
