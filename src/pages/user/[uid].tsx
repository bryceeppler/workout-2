import { useRouter } from "next/router";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import SignInPage from "~/components/signin";
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
import type { CompletedWorkouts } from "~/pages/index";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
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
  const { data: userActivity, isLoading: userActivityLoading } =
    api.activities.getByUser.useQuery({ userId: uid as string });
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
  const pointsForUser = points && getPointsForUser(uid as string, points);

  const minsSubmerged = userActivity
    ?.filter((activity) => activity.type === "cold plunge")
    .reduce((acc, activity) => acc + activity.value, 0);
  const minsCardio = userActivity
    ?.filter((activity) => activity.type === "cardio")
    .reduce((acc, activity) => acc + activity.value, 0);
  const minsStretching = userActivity
    ?.filter((activity) => activity.type === "stretch")
    .reduce((acc, activity) => acc + activity.value, 0);
  const mealsTracked = userActivity
    ?.filter((activity) => activity.type === "meal")
    .reduce((acc, activity) => acc + activity.value, 0);

  const numCompletedWorkouts = completedWorkouts?.filter((workout) => {
    console.log(workout);
    return workout.authorId === uid && workout.status === "completed";
  }).length;

  const numSkippedWorkouts = completedWorkouts?.filter(
    (workout) => workout.authorId === uid && workout.status === "skipped"
  ).length;

  const filteredCompletedWorkouts = completedWorkouts
    ?.filter((workout) => workout.authorId === uid)
    .sort((a, b) => {
      if (a.createdAt > b.createdAt) {
        return -1;
      }
      if (a.createdAt < b.createdAt) {
        return 1;
      }
      return 0;
    });

  console.log(numCompletedWorkouts);
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
          <div className="mx-3 flex flex-col">
            <div className="mt-5 flex flex-col gap-3">

              <div className="flex flex-col gap-2 text-sm mb-5 w-full max-w-sm mx-auto">
                <div className="text-lg font-bold">{pointsForUser} total points</div>
                <div className="flex justify-between">
                  <div>Workouts</div>
                  <div
                  className="font-bold text-emerald-300"
                  >{numCompletedWorkouts || 0}</div>
                </div>
                <div className="flex justify-between">
                  <div>Skipped</div>
                  <div
                  className="font-bold text-emerald-300"
                  >{numSkippedWorkouts}</div>
                </div>
                <div className="flex justify-between">
                  <div>Meals Tracked</div>
                  <div
                  className="font-bold text-emerald-300"
                  >{mealsTracked}</div>
                </div>
                <div className="flex justify-between">
                  <div>Mins Stretching</div>
                  <div
                  className="font-bold text-emerald-300"
                  >{minsStretching}</div>
                </div>
                <div className="flex justify-between">
                  <div>Mins Cardio</div>
                  <div
                  className="font-bold text-emerald-300"
                  >{minsCardio}</div>
                </div>
                <div className="flex justify-between">
                  <div>Mins Submerged</div>
                  <div
                  className="font-bold text-emerald-300"
                  >{minsSubmerged}</div>
                </div> 
                <div className="flex justify-between">
                  <div>Overkill Points</div>
                  <div
                  className="font-bold text-emerald-300"
                  >0</div>
                </div> 
              </div>




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
                            {points && completedWorkouts && (
                <div className="mx-auto flex flex-col justify-center my-5">
                  <div className="text-white">Last 4 Weeks</div>
                  <UserHeatmap
                    points={points}
                    completedWorkouts={completedWorkouts}
                    userId={uid as string}
                    weeks={4}
                  />
                </div>
              )}
              {/* Completed workout histroy */}
              <div>
                <h2 className="my-2 text-xl font-bold text-emerald-400">
                  History
                </h2>
                {
                  <div className="flex flex-col gap-3">
                    {filteredCompletedWorkouts?.map((workout) => {
                      return (
                        <Link
                          key={workout.id}
                          className="rounded border border-neutral-600 p-2 hover:bg-neutral-700"
                          href={`/workout/${workout.workout.id}`}
                        >
                          <div className=" flex w-full flex-row items-center justify-between">
                            <div>{workout.workout.title}</div>
                            <div
                              className={`text-xs ${
                                workout.status === "completed"
                                  ? "text-emerald-400"
                                  : " text-red-500"
                              }`}
                            >
                              {workout.status}{" "} 
                              {dayjs(workout.createdAt).fromNow()}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default User;
