import { useRouter } from "next/router";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
import { LoadingSpinner } from "~/components/loading";
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
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
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
  console.log("user data", userData);
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

  const { data: weightActivities, isLoading: weightActivitiesLoading } =
    api.activities.getWeightActivitiesByUser.useQuery({
      userId: uid as string,
    });

  console.log(weightActivities);
  const data = {
    labels: ["Meals", "Stretch", "Cardio", "Workouts", "Cold Plunge"],
    datasets: [
      {
        label: "# of Points",
        data: spiderChartData,
        backgroundColor: "rgba(124, 58, 237, 0.4)",
        borderColor: "rgba(124, 58, 237, 1)",
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

  const dummyLineData = [
    { name: "Page A", uv: 400, pv: 2400, amt: 2400 },
    { name: "Page B", uv: 300, pv: 1398, amt: 2210 },
    { name: "Page C", uv: 200, pv: 9800, amt: 2290 },
    { name: "Page D", uv: 278, pv: 3908, amt: 2000 },
    { name: "Page E", uv: 189, pv: 4800, amt: 2181 },
    { name: "Page F", uv: 239, pv: 3800, amt: 2500 },
    { name: "Page G", uv: 349, pv: 4300, amt: 2100 },
  ];

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
      <main className="flex h-screen justify-center">
        <div className="h-full w-full md:max-w-2xl">
          <div className="flex border-b border-neutral-600 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && usersData && (
              <div className="flex w-full items-center justify-between">
                <h2 className="text-2xl font-bold text-violet-400 ">
                  {userData?.firstName} {userData?.lastName}
                </h2>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded border border-violet-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-neutral-700"
                >
                  Back
                </button>
              </div>
            )}
          </div>
          <div className="mx-3 flex flex-col">
            <div className="mt-5 flex flex-col gap-3">
              <div className="mx-auto mb-5 flex w-full max-w-sm flex-col gap-2 bg-neutral-800 p-4 text-sm">
                <div>
                  <div className="text-lg font-bold">Statistics</div>
                  <div className="font-mono text-violet-300">
                    {pointsForUser} total points
                  </div>
                </div>
                <div className="flex justify-between border-b border-neutral-600 pb-2">
                  <div>Completed workouts</div>
                  <div className="font-bold text-violet-300">
                    {numCompletedWorkouts || 0}
                  </div>
                </div>
                <div className="flex justify-between border-b border-neutral-600 pb-2">
                  <div>Skipped workouts</div>
                  <div className="font-bold text-violet-300">
                    {numSkippedWorkouts}
                  </div>
                </div>
                <div className="flex justify-between border-b border-neutral-600 pb-2">
                  <div>Meals tracked</div>
                  <div className="font-bold text-violet-300">
                    {mealsTracked}
                  </div>
                </div>
                <div className="flex justify-between border-b border-neutral-600 pb-2">
                  <div>Stretching (min)</div>
                  <div className="font-bold text-violet-300">
                    {minsStretching}
                  </div>
                </div>
                <div className="flex justify-between border-b border-neutral-600 pb-2">
                  <div>Cardio (min)</div>
                  <div className="font-bold text-violet-300">{minsCardio}</div>
                </div>
                <div className="flex justify-between border-b border-neutral-600 pb-2">
                  <div>Cold plunge (min)</div>
                  <div className="font-bold text-violet-300">
                    {minsSubmerged}
                  </div>
                </div>
                <div className="flex justify-between border-b border-neutral-600 pb-2">
                  <div>Overkill Points</div>
                  <div className="font-bold text-violet-300">0</div>
                </div>
              </div>

              {spiderChartLoading ? (
                <LoadingSpinner />
              ) : (
                data && (
                  <div className="flex h-64 w-full justify-center p-2">
                    <Radar
                      data={data}
                      options={{
                        responsive: true,
                        // change radar chart color to green
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
              {weightActivities && (
                <div>
                  <div className="mx-auto mb-2 flex w-full text-xl font-semibold text-violet-400">
                    Weight
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={weightActivities}
                      margin={{ top: 20, right: 0, left: 5, bottom: 5 }}
                    >
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                      <CartesianGrid stroke="#ccc" />
                      <XAxis
                        dataKey="createdAt"
                        tickFormatter={(time) => {
                          return dayjs(time as Date).format("MMM DD");
                        }}
                      />
                      <YAxis
                        tickFormatter={(value) => {
                          return `${String(Math.floor(value as number))} lbs`;
                        }}
                        // domain starts at 100 and goes to 10 above the max value
                        domain={[100, "dataMax"]}
                      />{" "}
                      <RechartsTooltip
                        labelFormatter={(label: Date) =>
                          dayjs(label).format("MMM DD")
                        }
                        labelStyle={{
                          color: "white",
                        }}
                        contentStyle={{
                          backgroundColor: "black",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {points && completedWorkouts && (
                <div className="mx-auto my-5 flex flex-col justify-center">
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
              <div className="mb-10">
                <h2 className="my-2 text-xl font-bold text-violet-400">
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
                                  ? "text-violet-400"
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
