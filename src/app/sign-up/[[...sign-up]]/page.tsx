import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <SignUp />
    </div>
  );
}
