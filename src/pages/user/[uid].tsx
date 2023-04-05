import { useRouter } from "next/router";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const User = () => {
  const router = useRouter();
  const { uid } = router.query;
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const utils = api.useContext();
  const { data: userData, isLoading: userDataLoading } =
    api.users.getUserInfo.useQuery({ userId: uid as string });

  if (!userLoaded) return <LoadingPage />;

  if (!isSignedIn) return <SignInPage />;

  return (
    <>
      <Head>
        <title>Gym App 2</title>
        <meta name="description" content="Brycey boys website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full md:max-w-2xl">
          <div className="flex border-b border-neutral-600 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && (
              <div className="flex w-full justify-between">
                <div>
                  <p>User: {uid}</p>
                </div>
                <SignOutButton />
              </div>
            )}
          </div>
          {userDataLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex justify-between">
                <h2 className="font- text-2xl font-bold text-emerald-400">
                  {userData?.firstName} {userData?.lastName}
                </h2>
                <Link
                  href="/"
                  className="rounded border border-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-neutral-700"
                >
                  Back
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Toaster
        toastOptions={{
          className: "",
          style: {
            color: "white",
            background: "#44403c",
            border: "1px solid #10b981",
          },
        }}
      />
    </>
  );
};

export default User;
