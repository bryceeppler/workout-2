import { useRouter } from "next/router";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
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
          <div
            className="flex flex-col mx-2"
          >
          {userDataLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-emerald-400">
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
          <div
            className="flex flex-col gap-3 mt-5"
          >
          {
            points && completedWorkouts && (
              <div
                className="flex justify-center"
              >
              <UserHeatmap points={points}
              completedWorkouts={completedWorkouts}
              userId={user.id}
              weeks={2}

              /></div>
            )
          }
          {spiderChartLoading ? (
            <LoadingSpinner />
          ) : (
            data && (
              <div
                className="flex justify-center w-full h-64"
              >
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
              /></div>
            )
          )}</div>
          </div>
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
