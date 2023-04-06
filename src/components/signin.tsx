import { SignInButton } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex h-screen justify-center">
    <div className="flex justify-center text-violet-500">
      <SignInButton />
    </div>
  </main>
  )
}