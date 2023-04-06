import { useRouter } from "next/router";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { getPointsForUser } from "..";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import UserHeatmap from "~/components/userHeatmap";
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const User = () => {
  const router = useRouter();
  const { uid } = router.query;
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const utils = api.useContext();
  const { data: userData, isLoading: userDataLoading } =
    api.users.getUserInfo.useQuery({ userId: uid as string });

  const { data: spiderChartData, isLoading: spiderChartLoading } =
    api.users.getUserSpiderChart.useQuery({ userId: uid as string });
  const { data: usersData, isLoading: usersLoading } =
    api.users.getAllUserInfo.useQuery();
  const { data: points, isLoading: pointsLoading } =
    api.users.getPoints.useQuery();
  const { data: completedWorkouts, isLoading: completedWorkoutsLoading } =
    api.completedWorkouts.getAll.useQuery();
  const data = {
    labels: ["Meals", "Stretch", "Cardio", "Workouts", "Cold Plunge"],
    datasets: [
      {
        label: "# of Points",
        data: spiderChartData,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };
  const pointsForUser = points && getPointsForUser(
    uid as string,
    points
  );
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
              <div className="flex w-full justify-between items-center">
                  <h2 className="text-2xl font-bold text-emerald-400 ">
                    {userData?.firstName} {userData?.lastName}
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
          <div className="mx-2 flex flex-col">
            <div className="mt-5 flex flex-col gap-3">
            
                <div># Workouts Complete</div>
                <div># Workouts Skipped</div>
                <div>Time Submerged</div>
                <div>Time Cardio</div>
                <div>Time Stretching</div>
                <div>Meals Tracked</div>
                <div>Overkill</div>


           
              {points && completedWorkouts && (
                <div className="flex flex-col mx-auto justify-center">
                  <div className="text-white">{pointsForUser} points total</div>
                  <UserHeatmap
                    points={points}
                    completedWorkouts={completedWorkouts}
                    userId={uid as string}
                    weeks={8}
                  />
                </div>
              )}
              {spiderChartLoading ? (
                <LoadingSpinner />
              ) : (
                data && (
                  <div className="flex h-64 w-full justify-center">
                    <Radar
                      data={data}
                      options={{
                        responsive: true,
                        // change line color to white
                        scales: {
                          r: {
                            pointLabels: {
                              color: "white",
                            },
                            angleLines: {
                              color: "gray",
                            },
                            grid: {
                              color: "gray",
                            },
                            ticks: {
                              // https://www.chartjs.org/docs/latest/axes/radial/#ticks
                              color: "white",
                              backdropColor: "transparent", // https://www.chartjs.org/docs/latest/axes/_common_ticks.html
                            },
                          },
                        },
                        maintainAspectRatio: false,
                        color: "white",
                        plugins: {
                          legend: {
                            labels: {
                              color: "white",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                
                )
              )}
              {/* Completed workout histroy */}
              <div>
                <h2 className="text-2xl font-bold text-emerald-400 ">
                  History
                </h2>
              </div>
            </div>
          </div>
        </div>
      </main>

    </>
  );
};

export default User;
