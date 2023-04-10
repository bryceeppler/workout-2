import React, { useCallback } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { SignOutButton, useUser } from "@clerk/nextjs";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import { LoadingPage } from "~/components/loading";
import { LoadingSpinner } from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import CloseButton from "~/components/closebutton";
import toast from "react-hot-toast";
import { type Dispatch, type SetStateAction } from "react";
import UserHeatmap from "~/components/userHeatmap";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

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
type ActivityModalProps = {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  showToast: () => void;
  userId: string;
};
const ActivityModal = ({
  setModalOpen,
  showToast,
  userId,
}: ActivityModalProps) => {
  const utils = api.useContext();
  const [selectedActivity, setSelectedActivity] = useState<string>("meal");
  const [activityValue, setActivityValue] = useState<number>(0);
  const [activityStrValue, setActivityStrValue] = useState<string>("0");
  const handleBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setActivityStrValue(e.target.value.toString());
    },
    [activityValue]
  );
  const addActivity = api.activities.addActivity.useMutation({
    onSuccess: () => {
      utils.users.getPoints.invalidate().catch((err) => console.error(err));
      utils.users.getActivityFeed
        .invalidate()
        .catch((err) => console.error(err));
      void utils.users.getAllUserInfo.invalidate();
      showToast();
      setModalOpen(false);
    },
  });
  return (
    <div className="fixed left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-neutral-900 bg-opacity-50 p-2 backdrop-blur-sm">
      <div className="z-20 w-full rounded border border-neutral-700 bg-neutral-900 p-4 sm:max-w-md">
        <div className="flex justify-between">
          <div className="text-xl font-bold">Add Activity</div>
          <CloseButton onClick={() => setModalOpen(false)} />
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <div className="text-sm font-bold">Choose your activity</div>

          <div className="mx-auto flex flex-row flex-wrap items-center justify-center gap-1">
            <div
              className={`w-36 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "meal"
                  ? "bg-violet-500 text-neutral-200 hover:bg-violet-400"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("meal")}
            >
              Meal
            </div>
            {/* cardio */}
            <div
              className={`w-36 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "cardio"
                  ? "bg-violet-500 text-neutral-200 hover:bg-violet-400"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("cardio")}
            >
              Cardio
            </div>

            {/* stretch */}
            <div
              className={`w-36 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "stretch"
                  ? "bg-violet-500 text-neutral-200 hover:bg-violet-400"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("stretch")}
            >
              Stretch
            </div>

            {/* cold plunge */}
            <div
              className={`w-36 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "cold plunge"
                  ? "bg-violet-500 text-neutral-200 hover:bg-violet-400"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("cold plunge")}
            >
              Cold Plunge
            </div>
            {/* Weight */}
            <div
              className={`w-36 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "weight"
                  ? "bg-violet-500 text-neutral-200 hover:bg-violet-400"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("weight")}
            >
              Weight
            </div>
          </div>

          <div className="mt-5 text-sm font-bold">
            {selectedActivity === "meal"
              ? "Number of meals"
              : selectedActivity === "weight"
              ? "Pounds"
              : "Minutes"}
          </div>
          <div className="">
            <input
              type="number"
              className="w-full rounded border border-neutral-600 bg-black p-2 focus:border-violet-500 focus:outline-none"
              value={activityStrValue === "0" ? "" : activityStrValue}
              onBlur={handleBlur}
              onChange={(e) => {
                setActivityValue(Number(e.target.value));
                setActivityStrValue(e.target.value);
              }}
            />
          </div>
          <div
            className="mx-auto mt-5 w-36 cursor-pointer rounded bg-violet-500 px-4 py-2 text-center font-semibold text-neutral-200 shadow hover:bg-violet-400"
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
const flameIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className="fill-orange-400"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.4997 4.93762C16.8478 6.87062 17.9949 11.1518 16.0619 14.4998C14.1289 17.8479 9.84775 18.995 6.4997 17.062C3.15166 15.129 2.00453 10.8479 3.93753 7.4998C4.10592 7.20813 4.29214 6.93316 4.49401 6.67548C4.69562 6.41812 5.08463 6.45704 5.28714 6.71368C5.56487 7.06565 5.88119 7.38577 6.22971 7.66764C6.56235 7.93667 7.01647 7.61943 7.00304 7.19183C7.00103 7.12812 7.00003 7.06416 7.00003 6.99997C7.00003 6.08143 7.20643 5.2111 7.57539 4.43282C8.10854 3.30822 8.98111 2.37583 10.0608 1.76798C10.3078 1.62893 10.6112 1.7522 10.7378 2.00584C11.3297 3.1927 12.2651 4.2248 13.4997 4.93762ZM14 12C14 14.2091 12.2092 16 10 16C8.08674 16 6.4791 14.6016 6.09017 12.8183C5.9966 12.3894 6.52967 12.1749 6.90396 12.4045C7.38998 12.7025 7.93731 12.8964 8.50538 12.9685C8.80801 13.0068 9.03609 12.7289 9.01482 12.4246C9.00501 12.2844 9.00002 12.1428 9.00002 12C9.00002 10.5731 9.49812 9.26254 10.3299 8.23269C10.4337 8.10417 10.599 8.04108 10.7612 8.07233C12.6063 8.4278 14 10.0511 14 12Z"
    />
  </svg>
);
type UserInfo = RouterOutputs["users"]["getAllUserInfo"][number];
const AddActivityWizard = (props: { userDetails?: UserInfo }) => {
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const showToast = () => {
    toast("Activity added!");
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
      <div className="flex justify-between">
        <div className="flex flex-row gap-3">
          <Image
            src={user.profileImageUrl}
            alt="Profile image"
            className="h-14 w-14 rounded-full"
            width={56}
            height={56}
          />
          <div className="flex flex-col">
            <div className="">{user.firstName}</div>
            <div className="flex flex-row items-center gap-1">
              {flameIcon()}
              <div className="text-sm text-neutral-400">
                {props.userDetails?.streak} day streak
              </div>
            </div>
            {/* <div className="text-xs text-neutral-400">{9} points</div> */}
          </div>
        </div>
        <div
          className="my-auto cursor-pointer "
          onClick={() => setModalOpen(true)}
        >
          {plusButton()}
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
      <div className="text-xl font-bold">Upcoming Workouts</div>
      {workouts?.map((workout) => (
        <IncompleteWorkoutView key={workout.id} workout={workout} />
      ))}
      <Link
        href="/workout"
        className="mx-auto cursor-pointer text-sm text-violet-500"
      >
        View all workouts
      </Link>
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
const ProgressView = (props: {
  points: PointsList;
  usersDetails: UserDetails;
  completedWorkouts: CompletedWorkouts;
}) => {
  const users = Object.values(props.points)
    .flatMap((userPoints) => Object.keys(userPoints))
    .filter((userId, index, self) => self.indexOf(userId) === index);

  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="text-xl font-bold">Progress</div>
      <div className="rounded border border-neutral-600 p-4">
        {users.map((userId) => (
          <div key={userId} className="mb-4">
            <Link
              href={`/user/${userId}`}
              className="truncate font-semibold hover:text-violet-400"
            >
              {props.usersDetails.find((user) => user.id === userId)?.firstName}
            </Link>
            <div className="text-sm text-neutral-400">
              {getPointsForUser(userId, props.points)} Points
            </div>
            {/* streak */}
            <div className="mb-2 flex flex-row items-center gap-1">
              {flameIcon()}
              <div className="text-sm text-neutral-400">
                {props.usersDetails.find((user) => user.id === userId)?.streak}{" "}
                day streak
              </div>
            </div>
            <UserHeatmap
              userId={userId}
              points={props.points}
              completedWorkouts={props.completedWorkouts}
              weeks={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const LeaderboardView = (props: {
  points: PointsList;
  usersDetails: UserDetails;
}) => {
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
      <div className="text-xl font-bold text-white">Leaderboard</div>
      <div className="mt-3 flex flex-col gap-3">
        {pointsArrToReturn.map((user) => (
          <Link
            key={user.userId}
            className="flex h-16 w-full flex-row items-center rounded p-2 text-white hover:border hover:border-violet-500 hover:bg-black"
            href={`/user/${user.userId}`}
          >
            <Image
              // src={`https://robohash.org/${user.userId || "tempuser"}?set=set2`}
              alt="Profile image"
              src={
                props.usersDetails.find(
                  (userDetails) => userDetails.id === user.userId
                )?.profileImageUrl || ""
              }
              width={46}
              height={46}
              className="bg-base mr-3 rounded-full"
            />
            <div className="flex w-full flex-col">
              <div
                //  cap the user id at 20 chars
                className="truncate font-semibold"
              >
                {
                  props.usersDetails.find(
                    (userDetails) => userDetails.id === user.userId
                  )?.firstName
                }
              </div>
              {/* Black background bar */}
              <div className="flex h-4 w-full flex-row items-center rounded-full bg-black">
                {/* Green progress bar */}
                <div
                  className="flex h-4 flex-row items-center rounded-full bg-violet-500"
                  style={{ width: `${(user.totalPoints / maxScore) * 100}%` }}
                ></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const plusButton = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15 2.8125C8.26903 2.8125 2.8125 8.26903 2.8125 15C2.8125 21.731 8.26903 27.1875 15 27.1875C21.731 27.1875 27.1875 21.731 27.1875 15C27.1875 8.26903 21.731 2.8125 15 2.8125ZM15.9375 11.25C15.9375 10.7322 15.5178 10.3125 15 10.3125C14.4822 10.3125 14.0625 10.7322 14.0625 11.25V14.0625H11.25C10.7322 14.0625 10.3125 14.4822 10.3125 15C10.3125 15.5178 10.7322 15.9375 11.25 15.9375H14.0625V18.75C14.0625 19.2678 14.4822 19.6875 15 19.6875C15.5178 19.6875 15.9375 19.2678 15.9375 18.75V15.9375H18.75C19.2678 15.9375 19.6875 15.5178 19.6875 15C19.6875 14.4822 19.2678 14.0625 18.75 14.0625H15.9375V11.25Z"
      className="fill-violet-500 hover:fill-violet-400"
    />
  </svg>
);

const Home: NextPage = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { data: usersData, isLoading: usersLoading } =
    api.users.getAllUserInfo.useQuery();
  const { data: points, isLoading: pointsLoading } =
    api.users.getPoints.useQuery();
  const { data, isLoading: workoutsLoading } =
    api.workouts.getIncomplete.useQuery(
      { userId: user?.id ?? "" },
      {
        enabled: userLoaded,
      }
    );
  const { data: feedData, isLoading: feedLoading } =
    api.users.getActivityFeed.useQuery();
  console.log(usersData);
  const { data: completedWorkouts, isLoading: completedWorkoutsLoading } =
    api.completedWorkouts.getAll.useQuery();

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
              {usersData && (
                <AddActivityWizard
                  userDetails={
                    usersData?.find(
                      (userDetails) => userDetails.id === user?.id
                    ) || {
                      streak: 0,
                      id: "",
                      firstName: null,
                      lastName: null,
                      emailAddresses: [],
                      profileImageUrl: "",
                      createdAt: 0,
                      updatedAt: 0,
                      username: null,
                    }
                  }
                />
              )}
            </div>
          </div>
          <div className="mx-3 flex flex-col gap-3">
            <UpcomingWorkoutsView workouts={data} />
            {!pointsLoading &&
            points &&
            !usersLoading &&
            usersData &&
            !completedWorkoutsLoading &&
            completedWorkouts ? (
              <>
                <ProgressView
                  points={points}
                  usersDetails={usersData}
                  completedWorkouts={completedWorkouts}
                />
                <LeaderboardView points={points} usersDetails={usersData} />
              </>
            ) : (
              <div className="mt-5 flex justify-center">
                <LoadingSpinner />
              </div>
            )}
            <div className="mt-5 flex flex-col gap-3">
              <div className="text-xl font-bold">Activity Feed</div>
              {!feedLoading &&
                feedData &&
                feedData.map((feedItem, i) => {
                  return (
                    <div
                      key={i}
                      className="rounded border border-neutral-600 p-2"
                    >
                      <div className="text-sm">{feedItem.message}</div>
                      <div className="text-xs text-neutral-400">
                        {/* dayjs to say how long ago
                         */}
                        {dayjs(feedItem.date).fromNow()}
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="mt-10 flex justify-center">
              <SignOutButton />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
