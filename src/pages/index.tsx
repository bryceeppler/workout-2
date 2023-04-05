import { type NextPage } from "next";
import Head from "next/head";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import LoadingPage from "~/components/loading";
import LoadingSpinner from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import CloseButton from "~/components/closebutton";
import toast, { Toaster } from "react-hot-toast";
import { Dispatch, SetStateAction } from "react";

function getDateString(date: Date): string {
  return date.toISOString()?.split("T")[0] ?? "";
}
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && (
        <div className="absolute top-0 left-0 mt-8 ml-4 bg-neutral-700 text-white text-xs rounded py-1 px-2 shadow">
          {content}
        </div>
      )}
      {children}
    </div>
  );
};
interface UserHeatmapProps {
  userId: string;
  points: PointsList;
}
function getLast14Days(): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates;
}


const UserHeatmap: React.FC<UserHeatmapProps> = ({ userId, points }) => {
  const last14Days = getLast14Days();

  return (
    <div className="grid grid-cols-7 gap-1 w-fit">
      {last14Days.reverse().map((date, index) => {
        const dateString = getDateString(date);
        const userPoints = points[dateString]?.[userId] || 0;
        let bgColor;
        let border;
        let hover;
        switch (userPoints) {
          case 1:
            bgColor = "bg-emerald-300";
            // border = "border border-neutral-400"
            hover = "hover:border hover:border-neutral-400"
            break;
          case 2:
            bgColor = "bg-emerald-500";
            // border = "border border-neutral-400"
            hover = "hover:border over:border-neutral-400"
            break;
          case 3:
            bgColor = "bg-emerald-700";
            // border = "border border-neutral-400"
            hover = "hover:border hover:border-neutral-400"
            break;
          default:
            bgColor = "bg-neutral-700";
            border = "border border-red-600";
            hover = "hover:bg-red-900";
        }

        return (
          <Tooltip
            key={index}
            content={`${userPoints} points on ${dateString}`}
          >
            <div
              className={`w-4 h-4 ${bgColor} ${border} ${hover} rounded`}
            ></div>
          </Tooltip>
        );
      })}
    </div>
  );
};

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
  const [selectedActivity, setSelectedActivity] = useState<String>("meal");
  const [activityValue, setActivityValue] = useState<Number>(0);
  const addActivity = api.activities.addActivity.useMutation({
    onSuccess: () => {
      utils.users.getPoints.invalidate();
      showToast();
      setModalOpen(false);
    },
  });
  return (
    <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-neutral-900 bg-opacity-50 backdrop-blur-sm">
      <div className="w-full rounded border border-neutral-700 bg-neutral-800 p-4 sm:max-w-md">
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
                  ? "bg-emerald-500 text-neutral-200"
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
                  ? "bg-emerald-500 text-neutral-200"
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
                  ? "bg-emerald-500 text-neutral-200"
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
                  ? "bg-emerald-500 text-neutral-200"
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

function getPointsForUser(userId: string, points: Points) {
  let userpoints = 0;
  Object.values(points).forEach((day) => {
    userpoints += day[userId] || 0;
  });
  return userpoints;
}
type PointsList = Points
const ProgressView = (props: { points: PointsList }) => {
  const users = Object.values(props.points)
    .flatMap((userPoints) => Object.keys(userPoints))
    .filter((userId, index, self) => self.indexOf(userId) === index);

  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="text-lg font-bold">Progress</div>
      <div className="rounded border border-neutral-600 p-4">
        {users.map((userId) => (
          <div key={userId} className="mb-4">
            <div className="font-semibold">User {userId}</div>
            <div className="text-sm text-neutral-400">{
              getPointsForUser(userId, props.points)
            } Points</div>
            <UserHeatmap userId={userId} points={props.points} />
          </div>
        ))}
      </div>
    </div>
  );
};


import React from "react";



const LeaderboardView = (props: {points: PointsList}) => {
  const score1 = 18;
  const score2 = 16;
  const score3 = 14;
  console.log(props.points);
  
  // [
  //   {
  //     "user.id": "1",
  //     "totalPoints": 18
  //   }
  // ]
  // get each unique user id and call getPointsForUser
  let pointsArrToReturn = []

  let users = new Set();

  for (const [_, value] of Object.entries(props.points)) {
    console.log(value);
    // now make a unique set of user ids
    for (const [userId, _] of Object.entries(value)) {
      users.add(userId);
    }

  }
  for (const userId of users) {
    pointsArrToReturn.push({
      "userId": userId as string,
      "totalPoints": getPointsForUser(userId as string, props.points)
    })
  }
  console.log(pointsArrToReturn);

  // order users by score
  const sortedUsers = pointsArrToReturn.sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  // get the highest score
  const maxScore = Math.max(...sortedUsers.map((user) => user.totalPoints));

  return (
    <div className="flex w-full flex-col text-left">
      <div className="my-2 text-lg font-bold text-white">Leaderboard</div>
      {
                  pointsArrToReturn.map((user) => (
                    <div key={user.userId} className="flex h-12 w-full flex-row items-center rounded p-2 text-white">
                      <img
                        src={`https://robohash.org/${user.userId || "tempuser"}?set=set2`}
                        className="mr-3 h-8 w-8 rounded-full bg-base"
                      />
                      <div className="flex w-full flex-col">
                        <div>{user.userId}</div>
                        {/* Black background bar */}
                        <div className="flex h-2 w-full flex-row items-center rounded bg-black">
                          {/* Green progress bar */}
                          <div
                            className="flex h-2 flex-row items-center rounded bg-green-500"
                            style={{ width: `${(user.totalPoints / maxScore) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
      }

    </div>
  );
}


const Home: NextPage = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  const { data: points, isLoading: pointsLoading } =
    api.users.getPoints.useQuery();
  const { data, isLoading: workoutsLoading } =
    api.workouts.getIncomplete.useQuery(
      { userId: user?.id ?? "" },
      {
        enabled: userLoaded,
      }
    );

  if (!userLoaded) return <LoadingPage />;

  // Return sign in page if user is not signed in
  if (!isSignedIn) return <SignInPage />;
  if (workoutsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;
      console.log(points)
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
          <UpcomingWorkoutsView workouts={data} />
          {
            !pointsLoading && points ? (<>
              <ProgressView points={points} />
              <LeaderboardView points={points} />
              </>
            ) : (
              <div className="mt-5 flex justify-center">
                <LoadingSpinner />
              </div>
            )

          }
          <div className="mt-5 flex justify-center">
            <SignOutButton />
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
