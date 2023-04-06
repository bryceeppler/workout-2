import { type NextPage } from "next";
import Head from "next/head";
import { SignOutButton, useUser } from "@clerk/nextjs";
import type { RouterOutputs } from "~/utils/api";
import {  api } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import LoadingPage from "~/components/loading";
import LoadingSpinner from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import CloseButton from "~/components/closebutton";
import toast, { Toaster } from "react-hot-toast";
import { Dispatch, SetStateAction } from "react";
import UserHeatmap from "~/components/userHeatmap";

export function getDateString(date: Date): string {
  return date.toISOString()?.split("T")[0] ?? "";
}
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && (
        <div className="absolute left-0 top-0 ml-4 mt-8 w-24 rounded bg-neutral-700 px-2 py-1 text-xs text-white shadow">
          {content}
        </div>
      )}
      {children}
    </div>
  );
};
export function getLast14Days(): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates;
}

export function sameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
interface ActivityModalProps {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  showToast: () => void;
  userId: string;
}
const ActivityModal = ({
  setModalOpen,
  showToast,
  userId,
}: ActivityModalProps) => {
  const utils = api.useContext();
  const [selectedActivity, setSelectedActivity] = useState<string>("meal");
  const [activityValue, setActivityValue] = useState<number>(0);
  const addActivity = api.activities.addActivity.useMutation({
    onSuccess: () => {
      utils.users.getPoints.invalidate().catch((err) => console.error(err));
      showToast();
      setModalOpen(false);
    },
  });
  return (
    <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-neutral-900 bg-opacity-50 backdrop-blur-sm z-20 ">
      <div className="w-full rounded border border-neutral-700 bg-neutral-800 p-4 sm:max-w-md z-20">
        <div className="flex justify-between">
          <div className="text-lg font-bold">Add Activity</div>
          <CloseButton onClick={() => setModalOpen(false)} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-sm font-bold">Activity</div>

          <div className="flex flex-grow">
            <div
              className={`w-40 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "meal"
                  ? "bg-emerald-500 text-neutral-200 hover:bg-emerald-600"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("meal")}
            >
              Meal
            </div>
            {/* cardio */}
            <div
              className={`w-40 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "cardio"
                  ? "bg-emerald-500 text-neutral-200 hover:bg-emerald-600"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("cardio")}
            >
              Cardio
            </div>

            {/* stretch */}
            <div
              className={`w-40 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "stretch"
                  ? "bg-emerald-500 text-neutral-200 hover:bg-emerald-600"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("stretch")}
            >
              Stretch
            </div>

            {/* cold plunge */}
            <div
              className={`w-40 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "cold plunge"
                  ? "bg-emerald-500 text-neutral-200 hover:bg-emerald-600"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("cold plunge")}
            >
              Cold Plunge
            </div>
          </div>

          <div className="text-sm font-bold">
            {selectedActivity === "meal" ? "Number of meals" : "Minutes"}
          </div>
          <div className="">
            <input
              type="number"
              className="w-full rounded border border-neutral-600 bg-black p-2 focus:border-emerald-500 focus:outline-none"
              value={Number(activityValue)}
              onChange={(e) => setActivityValue(Number(e.target.value))}
            />
          </div>
          <div
            className="mx-auto w-40 cursor-pointer rounded border border-emerald-600 bg-emerald-500 px-4 py-2 text-center font-semibold text-neutral-200 shadow hover:bg-emerald-400"
            onClick={() => {
              addActivity.mutate({
                activity: String(selectedActivity),
                value: Number(activityValue),
                userId: userId,
              });
            }}
          >
            Submit
          </div>
        </div>
      </div>
    </div>
  );
};
const AddActivityWizard = () => {
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const showToast = () => {
    toast("Activity added!", {
      className: "",
      style: {
        color: "white",
        background: "#44403c",
        border: "1px solid #10b981",
      },
    });
  };
  if (!user) return null;

  return (
    <>
      {modalOpen && (
        <ActivityModal
          setModalOpen={setModalOpen}
          showToast={showToast}
          userId={user.id}
        />
      )}
      <div className="flex gap-3">
        <Image
          src={user.profileImageUrl}
          alt="Profile image"
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
        {/* <div className="my-auto rounded border border-emerald-600 bg-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow hover:bg-emerald-400">
        Add meal
      </div> */}
        <div
          className="my-auto cursor-pointer rounded border border-emerald-600 bg-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow hover:bg-emerald-400"
          onClick={() => setModalOpen(true)}
        >
          Add activity
        </div>
      </div>
    </>
  );
};

type Workout = RouterOutputs["workouts"]["getIncomplete"][number];
const IncompleteWorkoutView = (props: { workout: Workout }) => {
  const { title, id } = props.workout;
  return (
    <Link
      href={`/workout/${id}`}
      className="rounded border border-neutral-600 p-4 hover:bg-neutral-800"
    >
      {title}
    </Link>
  );
};

const UpcomingWorkoutsView = (props: { workouts: Workout[] }) => {
  const { workouts } = props;
  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="text-lg font-bold">Upcoming Workouts</div>
      {workouts?.map((workout) => (
        <IncompleteWorkoutView key={workout.id} workout={workout} />
      ))}
    </div>
  );
};
interface Points {
  [date: string]: {
    [userId: string]: number;
  };
}

export function getPointsForUser(userId: string, points: Points) {
  let userpoints = 0;
  Object.values(points).forEach((day) => {
    userpoints += day[userId] || 0;
  });
  return userpoints;
}
export type PointsList = Points;
export type UserDetails = RouterOutputs["users"]["getAllUserInfo"];
export type CompletedWorkouts = RouterOutputs["completedWorkouts"]["getAll"];
const ProgressView = (props: { points: PointsList, usersDetails:UserDetails, completedWorkouts: CompletedWorkouts}) => {
  const users = Object.values(props.points)
    .flatMap((userPoints) => Object.keys(userPoints))
    .filter((userId, index, self) => self.indexOf(userId) === index);
  
  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="text-lg font-bold">Progress</div>
      <div className="rounded border border-neutral-600 p-4">
        {users.map((userId) => (
          <div key={userId} className="mb-4">
            <Link 
              href={`/user/${userId}`}
            className="truncate font-semibold hover:text-emerald-400">{props.usersDetails.find((user)=>user.id===userId)?.firstName}</Link>
            <div className="text-sm text-neutral-400">
              {getPointsForUser(userId, props.points)} Points
            </div>
            <UserHeatmap userId={userId} points={props.points} completedWorkouts={props.completedWorkouts} weeks={2}/>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from "react";
import { User } from "@clerk/nextjs/dist/api";
import { copyFile } from "fs";

const LeaderboardView = (props: { points: PointsList, usersDetails:UserDetails}) => {
  const pointsArrToReturn = [];
  const users = new Set();
  for (const [_, value] of Object.entries(props.points)) {
    for (const [userId, _] of Object.entries(value)) {
      users.add(userId);
    }
  }
  for (const userId of users) {
    pointsArrToReturn.push({
      userId: userId as string,
      totalPoints: getPointsForUser(userId as string, props.points),
    });
  }

  // order users by score
  const sortedUsers = pointsArrToReturn.sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  // get the highest score
  const maxScore = Math.max(...sortedUsers.map((user) => user.totalPoints));

  return (
    <div className="mt-5 flex w-full flex-col text-left">
      <div className="text-lg font-bold text-white">Leaderboard</div>
      {pointsArrToReturn.map((user) => (
        <Link
          key={user.userId}
          className="flex h-12 w-full flex-row items-center rounded p-2 text-white hover:bg-black hover:border hover:border-emerald-500"
          href={`/user/${user.userId}`}
        >
          <img
            // src={`https://robohash.org/${user.userId || "tempuser"}?set=set2`}
            src={
              props.usersDetails.find((userDetails)=>userDetails.id===user.userId)?.profileImageUrl
            }
            className="bg-base mr-3 h-8 w-8 rounded-full"
          />
          <div className="flex w-full flex-col">
            <div
              //  cap the user id at 20 chars
              className="truncate text-sm font-semibold"
            >
              {props.usersDetails.find((userDetails)=>userDetails.id===user.userId)?.firstName}
            </div>
            {/* Black background bar */}
            <div className="flex h-2 w-full flex-row items-center rounded bg-black">
              {/* Green progress bar */}
              <div
                className="flex h-2 flex-row items-center rounded bg-green-500"
                style={{ width: `${(user.totalPoints / maxScore) * 100}%` }}
              ></div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const {data: usersData, isLoading: usersLoading} = api.users.getAllUserInfo.useQuery();
  const { data: points, isLoading: pointsLoading } =
    api.users.getPoints.useQuery();
  const { data, isLoading: workoutsLoading } =
    api.workouts.getIncomplete.useQuery(
      { userId: user?.id ?? "" },
      {
        enabled: userLoaded,
      }
    );
    const { data: completedWorkouts, isLoading: completedWorkoutsLoading } = api.completedWorkouts.getAll.useQuery();



  if (!userLoaded) return <LoadingPage />;

  // Return sign in page if user is not signed in
  if (!isSignedIn) return <SignInPage />;
  if (workoutsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;
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
            <div className="flex w-full flex-col justify-between ">
              <AddActivityWizard />
            </div>
          </div>
          <div
            className="flex flex-col gap-3 mx-2"
          >
          <UpcomingWorkoutsView workouts={data} />
          {!pointsLoading && points && !usersLoading && usersData && !completedWorkoutsLoading && completedWorkouts ? (
            <>
              <ProgressView points={points} usersDetails={usersData} completedWorkouts={completedWorkouts}/>
              <LeaderboardView points={points} usersDetails={usersData} />
            </>
          ) : (
            <div className="mt-5 flex justify-center">
              <LoadingSpinner />
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <SignOutButton />
          </div>
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

export default Home;
