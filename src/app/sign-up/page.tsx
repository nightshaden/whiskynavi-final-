import { SignUpForm } from "./SignUpForm";

const Page = () => {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-[520px] bg-white rounded-2xl px-8 py-10 md:px-12">
        {/* Title */}
        <h1 className="text-center typo-bold-24 text-black mb-8">회원가입</h1>
        <SignUpForm />
      </section>
    </main>
  );
};

export default Page;