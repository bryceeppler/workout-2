import { useRouter } from "next/router";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

export default function WorkoutIndex() {
  const router = useRouter();
  const { wid } = router.query;
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const utils = api.useContext();
  const { data:allWorkouts, isLoading:allWorkoutsLoading} = api.workouts.getAll.useQuery();
  const { data:userCompletedWorkouts, isLoading:userCompletedWorkoutsLoading} = api.completedWorkouts.getAll.useQuery();

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
              <div className="flex w-full items-center justify-between">
                <h2 className="font- text-2xl font-bold text-emerald-400">
                 All Workouts
                </h2>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded border border-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-neutral-700"
                >
                  Back
                </button>
              </div>
            )}
          </div>
          <div
          className="flex flex-col gap-3 mx-3 mt-2">
              {
                allWorkouts?.map((workout) => {
                  return (
                    <Link key={workout.id} className="flex justify-between items-center border rounded border-neutral-600 p-4 hover:bg-neutral-700"
                      href={`/workout/${workout.id}`}
                    >
                      <div className="flex items-center">
                        <div className="flex flex-col">
                          <h3 className="text-md text-neutral-200">{workout.title}</h3>
                          <p className="text-sm text-neutral-500">Workout {workout.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-neutral-400">
                        {
                          userCompletedWorkouts?.find((completedWorkout) => completedWorkout.workoutId === workout.id) && "Completed"
                        }
                      </div>
                    </Link>
                  )
                })
              }
          </div>
          </div>
      </main>
    </>
  )
}